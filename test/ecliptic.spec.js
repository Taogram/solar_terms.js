/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2022-06-12 09:44:10
 * @LastEditors: lax
 * @LastEditTime: 2022-08-25 21:59:18
 * @FilePath: \tao_solar_terms\test\ecliptic.spec.js
 */
const Ecliptic = require("@/ecliptic.js");
const VEN = require("@/data/json/vsop87d.ven.json");

describe("《Astronomical.Algorithms》31.a jde=2448976.5 ven", () => {
	const jde = 2448976.5;
	const ecliptic = new Ecliptic(jde, { db: VEN });

	it(`t -0.007032169747`, () => {
		expect(ecliptic.dt).toBeCloseTo(-0.007032169747, 12);
	});
	it(`ven longitude -68.6592582`, () => {
		expect(ecliptic.calcSunEclipticLongitude()).toBeCloseTo(-68.6592582, 5);
	});
	it(`ven latitude -0.0457399`, () => {
		expect(ecliptic.calcSunEclipticLatitude()).toBeCloseTo(-0.0457399, 5);
	});
	it(`ven radius 0.724603`, () => {
		expect(ecliptic.sunPlanetRadius()).toBeCloseTo(0.724603, 5);
	});
});

describe("《Astronomical.Algorithms》24.b jde=2448908.5 ear", () => {
	const jde = 2448908.5;
	const ecliptic = new Ecliptic(jde);

	it(`ear sun-longitude  -43.63484796`, () => {
		expect(ecliptic.calcSunEclipticLongitude()).toBeCloseTo(-43.63484796, 5);
	});
	it(`ear sun-latitude -0.00000312`, () => {
		expect(ecliptic.calcSunEclipticLatitude()).toBeCloseTo(-0.00000312, 5);
	});
	it(`ear radius  0.99760775`, () => {
		expect(ecliptic.sunPlanetRadius()).toBeCloseTo(0.99760775, 5);
	});
	it(`ear ear-longitude  199°.907372`, () => {
		expect(ecliptic.calcEarEclipticLongitude()).toBeCloseTo(199.907372, 3);
	});
	it(`ear ear-latitude  +0".644`, () => {
		expect(ecliptic.calcEarEclipticLatitude() * 3600).toBeCloseTo(0.644, 3);
	});
});

describe("《Astronomical.Algorithms》32.a jde=2448976.5 ven", () => {
	const jde = 2448976.5;
	const ecliptic = new Ecliptic(jde);

	it(`ear FK5 longitude offset -0".09027`, () => {
		expect(ecliptic.FK5EclipticLongitudeOffset() * 3600).toBeCloseTo(
			-0.09027,
			4
		);
	});
	it(`ear FK5 latitude offset  +0".05535`, () => {
		expect(ecliptic.FK5EclipticLatitudeOffset() * 3600).toBeCloseTo(0.05535, 4);
	});

	it(`ear nutation offset 16".749`, () => {
		expect(ecliptic.longitudeNutationOffset() * 3600).toBeCloseTo(16.749, 4);
	});

	it(`ear nutation offset  -1".933`, () => {
		expect(ecliptic.latitudeNutationOffset() * 3600).toBeCloseTo(-1.933, 3);
	});
});
