/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2022-06-12 09:44:10
 * @LastEditors: lax
 * @LastEditTime: 2022-08-09 15:19:52
 * @FilePath: \tao_solar_terms\test\ecliptic.spec.js
 */
const Ecliptic = require("@/ecliptic.js");

describe("《Astronomical.Algorithms》 31.a jde=2448976.5", () => {
	const jde = 2448976.5;
	const ecliptic = new Ecliptic(jde);

	it(`t -0.007032169747`, () => {
		expect(ecliptic.dt).toBeCloseTo(-0.007032169747, 12);
	});
});
