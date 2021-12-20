/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2021-12-20 13:33:23
 * @LastEditors: lax
 * @LastEditTime: 2021-12-20 14:49:00
 * @FilePath: \tao_solar_terms\src\ecliptic.js
 */

const VSOP87D = require("./data/vsop87d.json");
const VSOP87D_SIMPLE = require("./data/vsop87d-simple.js");
const nutation = require("./data/nutation.js");
const Decimal = require("decimal.js");
const TIME = require("./tools/time");

class Ecliptic {
	constructor(jd, p) {
		this.dt = TIME.getDT(jd);
		p && this.setOptions(p);
	}

	setOptions(p) {
		// 样本繁简
		this.DB = p.integrity ? VSOP87D : VSOP87D_SIMPLE;
		this.DB = p.db ? p.db : this.DB;
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
	sumPeriodicTerm(collection, dt = this.dt) {
		let val = 0;
		collection.map((row) => {
			val += Number(row[0]) * Math.cos(Number(row[1]) + Number(row[2]) * dt);
		});
		return val;
	}

	$sumPeriodicTerm(collection, dt = this.dt) {
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
	sumEclipticBy(arr, dt = this.dt) {
		let L = arr
			.map((each) => {
				return this.sumPeriodicTerm(each, dt);
			})
			.reduceRight((acc, next) => {
				return acc * dt + next;
			}, 0);
		return L;
	}

	$sumEclipticBy(arr, dt = this.dt) {
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
	sunEclipticLongitude(dt = this.dt) {
		const l = this.sumEclipticBy(this.DB.l, dt);
		return this.circle(l * this.RADIAN_ANGLE + 180);
	}

	$sunEclipticLongitude(dt = this.dt) {
		const l = this.$sumEclipticBy(this.DB.l, dt);
		return this.$circle(l.mul(this.RADIAN_ANGLE).add(180));
	}

	/**
	 * 地心黄纬
	 * @returns
	 */
	sunEclipticLatitude(dt = this.dt) {
		const b = this.sumEclipticBy(this.DB.b, dt);
		return -(b * this.RADIAN_ANGLE);
	}

	$sunEclipticLatitude(dt = this.dt) {
		const b = this.$sumEclipticBy(this.DB.b, dt);
		return b.mul(this.RADIAN_ANGLE).negated();
	}

	/**
	 * 太阳到地球的距离
	 * @param {*} dt
	 * @returns
	 */
	sunEarthRadius(dt = this.dt) {
		const r = this.sumEclipticBy(this.DB.r, dt);
		return r;
	}

	$sunEarthRadius(dt = this.dt) {
		const r = this.$sumEclipticBy(this.DB.r, dt);
		return r;
	}

	/**
	 *VSOP87->TF5坐标系 地心黄经
	 * @param {*} dt
	 * @returns
	 */
	TF5EclipticLongitudeOffset(dt = this.dt) {
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

	$TF5EclipticLongitudeOffset(dt = this.dt) {
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
	TF5SunEclipticLatitudeOffset(dt = this.dt) {
		const T = dt * 10;
		const L = this.sunEclipticLongitude(dt);
		let dash = L - 1.397 * T - 0.00031 * T * T;
		dash /= this.RADIAN_ANGLE;
		return (0.03916 * (Math.cos(dash) - Math.sin(dash))) / 3600.0;
	}

	$TF5SunEclipticLatitudeOffset(dt = this.dt) {
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
	earLongitudeNutationOffset(dt = this.dt) {
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

	$earLongitudeNutationOffset(dt = this.dt) {
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
	getSunEclipticLongitude() {
		let l = this.sunEclipticLongitude();

		// ->TF5
		l += this.TF5EclipticLongitudeOffset();
		l += this.earLongitudeNutationOffset();
		l -= 20.4898 / this.sunEarthRadius() / 3600;
		return l;
	}

	$getSunEclipticLongitude() {
		let l = this.$sunEclipticLongitude();

		// ->TF5
		l = l.add(this.$TF5EclipticLongitudeOffset());
		l = l.add(this.$earLongitudeNutationOffset());
		l = l.sub(new Decimal(20.4898).div(this.$sunEarthRadius()).div(3600));
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
}

Ecliptic.prototype.DB = VSOP87D;
Ecliptic.prototype.RADIAN_ANGLE = 180 / Math.PI;
module.exports = Ecliptic;
