/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2021-12-18 19:10:07
 * @LastEditors: lax
 * @LastEditTime: 2021-12-19 13:49:38
 * @FilePath: \tao_solar_terms\src\index.js
 */
const VSOP87D = require("./data/vsop87d.json");
const nutation = require("./data/nutation.js");
const TIME = require("./tools/time");

class SolarTerms {
	constructor() {
		this.RADIAN_ANGLE = 180 / Math.PI;
	}

	circle(c) {
		let result = c % 360;
		if (c < 0) result += 360;
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

	/**
	 * 地心黄经
	 * @returns
	 */
	sunEclipticLongitude(dt) {
		const l = this.sumEclipticBy(VSOP87D.l, dt);
		return this.circle(l * this.RADIAN_ANGLE + 180);
	}

	/**
	 * 地心黄纬
	 * @returns
	 */
	sunEclipticLatitude(dt) {
		const b = this.sumEclipticBy(VSOP87D.b, dt);
		return -(b * this.RADIAN_ANGLE);
	}

	sunEarthRadius(dt) {
		const r = this.sumEclipticBy(VSOP87D.r, dt);
		return r;
	}

	TF5EclipticLongitudeOffset(dt) {
		const T = dt * 10;
		const L = this.sunEclipticLongitude(dt);
		const B = this.sunEclipticLatitude(dt);
		let dash = L - 1.397 * T - 0.00031 * T * T;
		dash /= this.RADIAN_ANGLE;
		return (
			(-0.09033 +
				0.03916 *
					(Math.cos(dash) + Math.sin(dash)) *
					Math.tan((B * 3600) / this.RADIAN_ANGLE)) /
			3600.0
		);
	}

	TF5SunEclipticLatitudeOffset(dt) {
		const T = dt * 10;
		const L = this.sunEclipticLongitude(dt);
		let dash = L - 1.397 * T - 0.00031 * T * T;
		dash /= this.RADIAN_ANGLE;
		return (0.03916 * (Math.cos(dash) - Math.sin(dash))) / 3600.0;
	}

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

	getSunEclipticLongitude(jd) {
		const dt = TIME.getDT(jd);
		let l = this.sunEclipticLongitude(dt);

		// ->TF5
		l += this.TF5EclipticLongitudeOffset(dt);
		l += this.earLongitudeNutationOffset(dt);
		l -= 20.4898 / this.sunEarthRadius(dt) / 3600;
		return l;
	}

	getD(T) {
		return (
			297.85036 + 455267.11148 * T - 0.0019142 * T * T + (T * T * T) / 189474
		);
	}

	getM(T) {
		return (
			357.52772 + 35999.05034 * T - 0.0001603 * T * T - (T * T * T) / 300000
		);
	}

	get_M(T) {
		return (
			134.96298 + 477198.867398 * T + 0.0086972 * T * T + (T * T * T) / 56250
		);
	}

	getF(T) {
		return (
			93.27191 + 483202.017538 * T - 0.0036825 * T * T + (T * T * T) / 327270
		);
	}

	getO(T) {
		return (
			125.04452 - 1934.136261 * T - 0.0020708 * T * T + (T * T * T) / 450000
		);
	}

	getBaseSection(year = this.year, angle = 0) {
		let m = ~~Math.ceil((angle + 90.0) / 30.0);
		m = m > 12 ? m - 12 : m;

		if (angle % 15 === 0 && angle % 30 !== 0) {
			return TIME.getJD(year, m, 1, 12, 0, 0);
		}

		return TIME.getJD(year, m, 29, 12, 0, 0);
	}

	getSolarTerm(year = this.year, angle = 0) {
		let JD0 = 0;
		let stDegree = 0;
		let stDegreep = 0;

		let JD1 = this.getBaseSection(year, angle);

		do {
			JD0 = JD1;
			stDegree = this.getSunEclipticLongitude(JD0) - angle;
			stDegree = angle === 0 && stDegree > 345.0 ? stDegree - 360.0 : stDegree;
			stDegreep =
				(this.getSunEclipticLongitude(JD0 + 0.000005) -
					this.getSunEclipticLongitude(JD0 - 0.000005)) /
				0.00001;
			JD1 = JD0 - stDegree / stDegreep;
		} while (Math.abs(JD1 - JD0) > 0.0000001);

		return JD1;
	}

	getSolarTerms(year) {
		return [
			0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225,
			240, 255, 270, 285, 300, 315, 330, 345,
		].map((angle) => {
			return TIME.JDToDate(this.getSolarTerm(year, angle));
		});
	}
}

module.exports = SolarTerms;
