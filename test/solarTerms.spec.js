/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2022-06-12 09:44:10
 * @LastEditors: lax
 * @LastEditTime: 2022-08-26 10:09:27
 * @FilePath: \tao_solar_terms\test\solarTerms.spec.js
 */
const SolarTerms = require("@/solarTerms.js");
const moment = require("moment");
const _2022 = require("./data/2022");

describe("year 2022", () => {
	const solarTerms = new SolarTerms();
	solarTerms.getSolarTermsAll(2022).map((date, i) => {
		const t = moment(date);
		const str = t.format("YYYY-MM-DD HH:mm:ss");
		it(`date ${str} is near ${_2022[i]}`, () => {
			expect(t.isSame(_2022[i], "d")).toBe(true);
		});
	});
});
