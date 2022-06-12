/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2022-06-12 09:44:10
 * @LastEditors: lax
 * @LastEditTime: 2022-06-12 09:51:55
 * @FilePath: \tao_solar_terms\test\ecliptic.spec.js
 */
const Ecliptic = require("@/ecliptic.js");
const ecliptic = new Ecliptic();

describe("calcPeriodicTerm", () => {
	const func = ecliptic.calcPeriodicTerm;
	console.log(func);
});
