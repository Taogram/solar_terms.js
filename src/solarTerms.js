/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2022-06-23 20:15:00
 * @LastEditors: lax
 * @LastEditTime: 2023-04-09 22:28:26
 * @FilePath: \tao_solar_terms\src\solarTerms.js
 */
const Julian = require("julian.js");
const Ecliptic = require("@/ecliptic.js");

/**
 * 二十四节气
 */
class SolarTerms {
	constructor(p = {}) {
		this.eOp = p.eclipticOptions || {};
		this.year = p.year || new Date().getFullYear();
	}

	getBaseSection(year = this.year, angle = 0) {
		let m = ~~Math.ceil((angle + 90.0) / 30.0);
		m = m > 12 ? m - 12 : m;

		if (angle % 15 === 0 && angle % 30 !== 0) {
			return Julian.DT$JD(year, m, 6, 12, 0, 0);
		}

		return Julian.DT$JD(year, m, 20, 12, 0, 0);
	}

	getSolarTerms(year = this.year, angle = 0) {
		let JD0 = 0;
		let stDegree = 0;
		let stDegreep = 0;

		let JD1 = this.getBaseSection(year, angle);

		do {
			JD0 = JD1;
			stDegree = new Ecliptic(JD0, this.eOp).getSunEclipticLongitude();
			stDegree = angle === 0 && stDegree > 345.0 ? stDegree - 360.0 : stDegree;
			stDegreep =
				(new Ecliptic(JD0 + 0.000005, this.eOp).getSunEclipticLongitude() -
					new Ecliptic(JD0 - 0.000005, this.eOp).getSunEclipticLongitude()) /
				0.00001;
			JD1 = JD0 - (stDegree - angle) / stDegreep;
		} while (Math.abs(JD1 - JD0) > 0.0000001);

		return JD1;
	}

	getSolarTermsAll(year = this.year) {
		return [
			285, 300, 315, 330, 345, 0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150,
			165, 180, 195, 210, 225, 240, 255, 270,
		].map((angle) => {
			const jd = this.getSolarTerms(year, angle);
			const DT = Julian.JD$UTC(jd);
			return DT;
		});
	}
}

module.exports = SolarTerms;
