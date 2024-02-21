/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2022-06-12 09:44:10
 * @LastEditors: lax
 * @LastEditTime: 2024-02-21 22:32:10
 * @FilePath: \tao_solar_terms\test\ecliptic.spec.js
 */
const Ecliptic = require("@/ecliptic.js");
const VEN = require("@/data/json/vsop87d-simple.ven.json");
describe("《Astronomical.Algorithms》31.a jde=2448976.5 ven", () => {
	const jde = 2448976.5;
	const ecliptic = new Ecliptic(jde, { db: VEN });

	it(`t -0.007032169747`, () => {
		expect(ecliptic.dt).toBeCloseTo(-0.007032169747, 12);
	});
	it(`ven longitude -68.6592582`, () => {
		expect(ecliptic.calcSunEclipticLongitude()).toBeCloseTo(-68.6592582, 6);
	});
	it(`ven latitude -0.0457399`, () => {
		expect(ecliptic.calcSunEclipticLatitude()).toBeCloseTo(-0.0457399, 6);
	});
	it(`ven radius 0.724603`, () => {
		expect(ecliptic.sunPlanetRadius()).toBeCloseTo(0.724603, 6);
	});
});

describe("《Astronomical.Algorithms》24.b jde=2448908.5 ear", () => {
	const jde = 2448908.5;
	const ecliptic = new Ecliptic(jde);

	it(`ear sun-longitude  -43.63484796`, () => {
		expect(ecliptic.calcSunEclipticLongitude()).toBeCloseTo(-43.63484796, 8);
	});
	it(`ear sun-latitude -0.00000312`, () => {
		expect(ecliptic.calcSunEclipticLatitude()).toBeCloseTo(-0.00000312, 8);
	});
	it(`ear radius  0.99760775`, () => {
		expect(ecliptic.sunPlanetRadius()).toBeCloseTo(0.99760775, 8);
	});
	it(`ear ear-longitude  199°.907372`, () => {
		expect(ecliptic.calcEarEclipticLongitude()).toBeCloseTo(199.907372, 6);
	});
	it(`ear ear-latitude  +0".644`, () => {
		expect(ecliptic.calcEarEclipticLatitude() * 3600).toBeCloseTo(0.644, 3);
	});
});

/**
 * test for longitude/latitude/radius
 */
describe("neoprogrammics.com/vsop87 VSOP87D EARTH TEST(FULL DATA)", () => {
	describe("jde = 2451545", () => {
		const jde = 2451545;
		const ecliptic = new Ecliptic(jde, { integrity: true });

		it(`t 0`, () => {
			expect(ecliptic.dt).toBe(0);
		});
		it(`ear sun-longitude  1.7519238681`, () => {
			expect(ecliptic.calcSunEclipticLongitude()).toBeCloseTo(1.7519238681, 10);
		});
		it(`ear sun-latitude -0.0000039656`, () => {
			expect(ecliptic.calcSunEclipticLatitude()).toBeCloseTo(-0.0000039656, 10);
		});
		it(`ear radius  0.9833276819`, () => {
			expect(ecliptic.sunPlanetRadius()).toBeCloseTo(0.9833276819, 10);
		});
	});

	describe("jde = 2415020", () => {
		const jde = 2415020;
		const ecliptic = new Ecliptic(jde, { integrity: true });

		it(`ear sun-longitude  +1.7391225563`, () => {
			expect(
				(ecliptic.calcSunEclipticLongitude() % Math.PI) + Math.PI
			).toBeCloseTo(1.7391225563, 10);
		});
		it(`ear sun-latitude -0.0000005679`, () => {
			expect(ecliptic.calcSunEclipticLatitude()).toBeCloseTo(-0.0000005679, 10);
		});
		it(`ear radius  0.9832689778`, () => {
			expect(ecliptic.sunPlanetRadius()).toBeCloseTo(0.9832689778, 10);
		});
	});

	describe("jde = 2378495", () => {
		const jde = 2378495;
		const ecliptic = new Ecliptic(jde, { integrity: true });

		it(`ear sun-longitude  1.7262638916`, () => {
			expect(
				(ecliptic.calcSunEclipticLongitude() % Math.PI) + Math.PI
			).toBeCloseTo(1.7262638916, 10);
		});
		it(`ear sun-latitude 0.0000002083`, () => {
			expect(ecliptic.calcSunEclipticLatitude()).toBeCloseTo(0.0000002083, 10);
		});
		it(`ear radius  0.9832274321`, () => {
			expect(ecliptic.sunPlanetRadius()).toBeCloseTo(0.9832274321, 10);
		});
	});
});

describe("《Astronomical.Algorithms》24. jde=2448908.5 ear test all", () => {
	const jde = 2448908.5;
	const ecliptic = new Ecliptic(jde, { nutation: { iau: "1980" } });

	it(`ear longitude -43.63484796`, () => {
		expect(ecliptic.calcSunEclipticLongitude()).toBeCloseTo(-43.63484796, 8);
	});

	it(`ear longitude 199.907372`, () => {
		expect(ecliptic.calcEarEclipticLongitude()).toBeCloseTo(199.907372, 6);
	});

	it(`ear FK5 longitude offset -0.000025`, () => {
		expect(ecliptic.FK5EclipticLongitudeOffset()).toBeCloseTo(-0.000025, 6);
	});

	it(`ear FK5 latitude offset  -0".023`, () => {
		expect(ecliptic.FK5EclipticLatitudeOffset() * 3600).toBeCloseTo(-0.023, 3);
	});

	it(`ear nutation  15"908`, () => {
		expect(ecliptic.longitudeNutationOffset() * 3600).toBeCloseTo(15.908, 3);
	});

	it(`ear light offset  -20".539`, () => {
		expect(ecliptic.longitudeLightOffset() * 3600).toBeCloseTo(-20.539, 3);
	});

	it(`ear longitude  199 54 21.818`, () => {
		expect(ecliptic.getSunEclipticLongitude()).toBeCloseTo(
			(21.818 / 60 + 54) / 60 + 199,
			4
		);
	});
});
