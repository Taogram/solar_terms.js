/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2022-06-12 09:44:10
 * @LastEditors: lax
 * @LastEditTime: 2022-08-09 23:40:13
 * @FilePath: \tao_solar_terms\test\ecliptic.spec.js
 */
const Ecliptic = require("@/ecliptic.js");

describe("《jde=2448976.5 ear", () => {
	const jde = 2448976.5;
	const ecliptic = new Ecliptic(jde);

	it(`t -0.007032169747`, () => {
		expect(ecliptic.dt).toBeCloseTo(-0.007032169747, 12);
	});
	it(`ven longitude -42.44018088538374`, () => {
		expect(ecliptic.calcSunEclipticLongitude()).toBeCloseTo(-42.44018088, 5);
	});
	it(`ven longitude fk5 offset -0.0000251677`, () => {
		expect(ecliptic.FK5EclipticLongitudeOffset()).toBeCloseTo(-0.0000251677, 9);
	});
});
