/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2021-12-18 19:10:07
 * @LastEditors: lax
 * @LastEditTime: 2021-12-20 00:55:57
 * @FilePath: \tao_solar_terms\src\index.js
 */
const VSOP87D = require("./data/vsop87d.json");
const VSOP87D_SIMPLE = require("./data/vsop87d-simple.js");
const nutation = require("./data/nutation.js");
const Decimal = require("decimal.js");
const TIME = require("./tools/time");
const moment = require("moment");

class SolarTerms {
	constructor(p = {}) {
		// 是否使用精确计算，处理浮点数误差
		this.accurate = p.accurate === true;
		// 样本繁简
		this.DB = p.integrity ? VSOP87D : VSOP87D_SIMPLE;
		this.DB = p.db ? p.db : this.DB;
		this.RADIAN_ANGLE = 180 / Math.PI;
	}

	circle(c) {
		let result = c % 360;
		if (c < 0) result += 360;
		return result;
	}

	$circle(c) {
		let result = c.modulo(360);
		if (c < 0) result = result.add(360);
		return result;
	}

	/**
	 * 计算周期项
	 * @param {*} collection
	 * @returns
	 */
	sumPeriodicTerm(collection, dt) {
		let val = 0;
		collection.map((row) => {
			val += Number(row[0]) * Math.cos(Number(row[1]) + Number(row[2]) * dt);
		});
		return val;
	}

	$sumPeriodicTerm(collection, dt) {
		let val = new Decimal(0);
		collection.map((row) => {
			let a = Number(row[0]);
			let b = Number(row[1]);
			let c = Number(row[2]);
			let cal = Decimal.cos(dt.mul(c).add(b)).mul(a);
			val = val.add(cal);
		});
		return val;
	}

	/**
	 * 根据X计算周期
	 * @param {*} arr
	 * @returns
	 */
	sumEclipticBy(arr, dt) {
		let L = arr
			.map((each) => {
				return this.sumPeriodicTerm(each, dt);
			})
			.reduceRight((acc, next) => {
				return acc * dt + next;
			}, 0);
		return L;
	}

	$sumEclipticBy(arr, dt) {
		let L = arr
			.map((each) => {
				return this.$sumPeriodicTerm(each, dt);
			})
			.reduceRight((acc, next) => {
				return dt.mul(acc).add(next);
			}, 0);
		return L;
	}

	/**
	 * 地心黄经
	 * @returns
	 */
	sunEclipticLongitude(dt) {
		const l = this.sumEclipticBy(this.DB.l, dt);
		return this.circle(l * this.RADIAN_ANGLE + 180);
	}

	$sunEclipticLongitude(dt) {
		const l = this.$sumEclipticBy(this.DB.l, dt);
		return this.$circle(l.mul(this.RADIAN_ANGLE).add(180));
	}

	/**
	 * 地心黄纬
	 * @returns
	 */
	sunEclipticLatitude(dt) {
		const b = this.sumEclipticBy(this.DB.b, dt);
		return -(b * this.RADIAN_ANGLE);
	}

	$sunEclipticLatitude(dt) {
		const b = this.$sumEclipticBy(this.DB.b, dt);
		return b.mul(this.RADIAN_ANGLE).negated();
	}

	/**
	 * 太阳到地球的距离
	 * @param {*} dt
	 * @returns
	 */
	sunEarthRadius(dt) {
		const r = this.sumEclipticBy(this.DB.r, dt);
		return r;
	}

	$sunEarthRadius(dt) {
		const r = this.$sumEclipticBy(this.DB.r, dt);
		return r;
	}

	/**
	 *VSOP87->TF5坐标系 地心黄经
	 * @param {*} dt
	 * @returns
	 */
	TF5EclipticLongitudeOffset(dt) {
		const T = dt * 10;
		const L = this.sunEclipticLongitude(dt);
		const B = this.sunEclipticLatitude(dt);
		let dash = L - T * 1.397 - 0.00031 * T * T;
		dash /= this.RADIAN_ANGLE;
		return (
			(-0.09033 +
				0.03916 *
					(Math.cos(dash) + Math.sin(dash)) *
					Math.tan((B * 3600) / this.RADIAN_ANGLE)) /
			3600.0
		);
	}

	$TF5EclipticLongitudeOffset(dt) {
		const T = dt.mul(10);
		const L = this.$sunEclipticLongitude(dt);
		const B = this.$sunEclipticLatitude(dt);
		let dash = L.sub(T.mul(1.397)).sub(T.mul(T).mul(0.00031));
		dash = dash.div(this.RADIAN_ANGLE);
		return new Decimal(-0.09033)
			.add(0.03916)
			.mul(Decimal.cos(dash).add(Decimal.sin(dash)))
			.mul(Decimal.tan(B.mul(3600).div(this.RADIAN_ANGLE)))
			.div(3600.0);
	}

	/**
	 * VSOP87->TF5坐标系 地心黄纬
	 * @param {*} dt
	 * @returns
	 */
	TF5SunEclipticLatitudeOffset(dt) {
		const T = dt * 10;
		const L = this.sunEclipticLongitude(dt);
		let dash = L - 1.397 * T - 0.00031 * T * T;
		dash /= this.RADIAN_ANGLE;
		return (0.03916 * (Math.cos(dash) - Math.sin(dash))) / 3600.0;
	}

	$TF5SunEclipticLatitudeOffset(dt) {
		const T = dt.mul(10);
		const L = this.$sunEclipticLongitude(dt);
		let dash = L.sub(T.mul(1.397)).sub(T.mul(T).mul(0.00031));
		dash = dash.div(this.RADIAN_ANGLE);
		return Decimal.cos(dash).sub(Decimal.sin(dash)).mul(0.03916).div(3600.0);
	}

	/**
	 * 地球章动修正
	 * @param {*} dt
	 * @returns
	 */
	earLongitudeNutationOffset(dt) {
		const T = dt * 10;
		let result = 0;
		nutation.map((row) => {
			let argument =
				this.getM(T) * row[0] +
				this.get_M(T) * row[1] +
				this.getD(T) * row[2] +
				this.getF(T) * row[3] +
				this.getO(T) * row[4];
			argument /= this.RADIAN_ANGLE;

			result += (row[5] + row[6] * T) * Math.sin(argument);
		});
		return (result * 0.0001) / 3600;
	}

	$earLongitudeNutationOffset(dt) {
		const T = dt.mul(10);
		let result = new Decimal(0);
		nutation.map((row) => {
			let argument = this.$getM(T)
				.mul(row[0])
				.add(this.$get_M(T).mul(row[1]))
				.add(this.$getD(T).mul(row[2]))
				.add(this.$getF(T).mul(row[3]))
				.add(this.$getO(T).mul(row[4]));
			argument = argument.div(this.RADIAN_ANGLE);

			result = result.add(T.mul(row[6]).add(row[5]).mul(Decimal.sin(argument)));
		});
		return result.mul(0.0001).div(3600);
	}

	/**
	 * 获取地心视黄经
	 * @param {*} jd
	 * @returns
	 */
	getSunEclipticLongitude(jd) {
		const dt = TIME.getDT(jd);
		let l = this.sunEclipticLongitude(dt);

		// ->TF5
		l += this.TF5EclipticLongitudeOffset(dt);
		l += this.earLongitudeNutationOffset(dt);
		l -= 20.4898 / this.sunEarthRadius(dt) / 3600;
		return l;
	}

	$getSunEclipticLongitude(jd) {
		const dt = new Decimal(TIME.getDT(jd));
		let l = this.$sunEclipticLongitude(dt);

		// ->TF5
		l = l.add(this.$TF5EclipticLongitudeOffset(dt));
		l = l.add(this.$earLongitudeNutationOffset(dt));
		l = l.sub(new Decimal(20.4898).div(this.$sunEarthRadius(dt)).div(3600));
		return l;
	}

	getD(T) {
		return (
			297.85036 + 455267.11148 * T - 0.0019142 * T * T + (T * T * T) / 189474
		);
	}

	$getD(T) {
		return new Decimal(297.85036)
			.add(T.mul(455267.11148))
			.sub(T.mul(T).mul(0.0019142))
			.add(T.mul(T).mul(T).div(189474));
	}

	getM(T) {
		return (
			357.52772 + 35999.05034 * T - 0.0001603 * T * T - (T * T * T) / 300000
		);
	}

	$getM(T) {
		return new Decimal(357.52772)
			.add(T.mul(35999.05034))
			.sub(T.mul(T).mul(0.0001603))
			.add(T.mul(T).mul(T).div(300000));
	}

	get_M(T) {
		return (
			134.96298 + 477198.867398 * T + 0.0086972 * T * T + (T * T * T) / 56250
		);
	}

	$get_M(T) {
		return new Decimal(134.96298)
			.add(T.mul(477198.867398))
			.sub(T.mul(T).mul(0.0086972))
			.add(T.mul(T).mul(T).div(56250));
	}

	getF(T) {
		return (
			93.27191 + 483202.017538 * T - 0.0036825 * T * T + (T * T * T) / 327270
		);
	}

	$getF(T) {
		return new Decimal(93.27191)
			.add(T.mul(483202.017538))
			.sub(T.mul(T).mul(0.0036825))
			.add(T.mul(T).mul(T).div(327270));
	}

	getO(T) {
		return (
			125.04452 - 1934.136261 * T - 0.0020708 * T * T + (T * T * T) / 450000
		);
	}

	$getO(T) {
		return new Decimal(125.04452)
			.add(T.mul(1934.136261))
			.sub(T.mul(T).mul(0.0020708))
			.add(T.mul(T).mul(T).div(450000));
	}

	getBaseSection(year = this.year, angle = 0) {
		let m = ~~Math.ceil((angle + 90.0) / 30.0);
		m = m > 12 ? m - 12 : m;

		if (angle % 15 === 0 && angle % 30 !== 0) {
			return TIME.DT$JD(year, m, 1, 12, 0, 0);
		}

		return TIME.DT$JD(year, m, 29, 12, 0, 0);
	}

	getSolarTerm(year = this.year, angle = 0) {
		const FUNC = this.accurate ? "$" : "";
		let JD0 = 0;
		let stDegree = 0;
		let stDegreep = 0;

		let JD1 = this.getBaseSection(year, angle);

		do {
			JD0 = JD1;
			stDegree = this[`${FUNC}getSunEclipticLongitude`](JD0) - angle;
			stDegree = angle === 0 && stDegree > 345.0 ? stDegree - 360.0 : stDegree;
			stDegreep =
				(this[`${FUNC}getSunEclipticLongitude`](JD0 + 0.000005) -
					this[`${FUNC}getSunEclipticLongitude`](JD0 - 0.000005)) /
				0.00001;
			JD1 = JD0 - stDegree / stDegreep;
		} while (Math.abs(JD1 - JD0) > 0.0000001);

		return JD1;
	}

	getSolarTerms(year) {
		return [
			285, 300, 315, 330, 345, 0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150,
			165, 180, 195, 210, 225, 240, 255, 270,
		].map((angle) => {
			const jd = this.getSolarTerm(year, angle);
			const DT = TIME.JD$DT(jd);
			const UT = moment(DT)
				.subtract(~~TIME.offsetUT$DT(jd), "s")
				.add(8, "h");
			return UT;
		});
	}
}

module.exports = SolarTerms;
