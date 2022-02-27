/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2021-12-18 19:10:07
 * @LastEditors: lax
 * @LastEditTime: 2022-02-27 14:49:33
 * @FilePath: \tao_solar_terms\src\index.js
 */
const TIME = require("./tools/time");
const moment = require("moment");
const Ecliptic = require("./ecliptic");

/**
 * 二十四节气
 */
class SolarTerms {
	constructor(p = {}) {
		// 样本繁简
		this.integrity = p.integrity;
		this.db = p.db;
		this.option = this.getOptions();
	}

	getOptions() {
		return { integrity: this.integrity, db: this.db };
	}

	getBaseSection(year = this.year, angle = 0) {
		let m = ~~Math.ceil((angle + 90.0) / 30.0);
		m = m > 12 ? m - 12 : m;

		if (angle % 15 === 0 && angle % 30 !== 0) {
			return TIME.DT$JD(year, m, 1, 12, 0, 0);
		}

		return TIME.DT$JD(year, m, 29, 12, 0, 0);
	}

	getSolarTerms(year = this.year, angle = 0) {
		let JD0 = 0;
		let stDegree = 0;
		let stDegreep = 0;

		let JD1 = this.getBaseSection(year, angle);

		do {
			JD0 = JD1;
			stDegree =
				new Ecliptic(JD0, this.option).getSunEclipticLongitude() - angle;
			stDegree = angle === 0 && stDegree > 345.0 ? stDegree - 360.0 : stDegree;
			stDegreep =
				(new Ecliptic(JD0 + 0.000005, this.option).getSunEclipticLongitude() -
					new Ecliptic(JD0 - 0.000005, this.option).getSunEclipticLongitude()) /
				0.00001;
			JD1 = JD0 - stDegree / stDegreep;
		} while (Math.abs(JD1 - JD0) > 0.0000001);

		return JD1;
	}

	getSolarTermsAll(year) {
		return [
			285, 300, 315, 330, 345, 0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150,
			165, 180, 195, 210, 225, 240, 255, 270,
		].map((angle) => {
			const jd = this.getSolarTerms(year, angle);
			const DT = TIME.JD$DT(jd);
			const UT = moment(DT)
				.subtract(~~TIME.offsetUT$DT(jd), "s")
				.add(8, "h");
			return UT;
		});
	}
}

module.exports = SolarTerms;
