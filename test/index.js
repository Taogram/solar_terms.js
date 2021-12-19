/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2021-12-18 22:32:00
 * @LastEditors: lax
 * @LastEditTime: 2021-12-19 13:15:01
 * @FilePath: \tao_solar_terms\test\index.js
 */
const moment = require("moment");
const TIME = require("./../src/tools/time");
const SolarTerms = require("./../src/index");

let results = new SolarTerms().getSolarTerms(2021);
results.map((one) => {
	const obj = moment(one).format("YYYY-MM-DD HH:mm:ss");
	console.log(obj);
});
