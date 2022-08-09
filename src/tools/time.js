/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2021-12-19 10:29:06
 * @LastEditors: lax
 * @LastEditTime: 2022-08-09 23:47:45
 * @FilePath: \tao_solar_terms\src\tools\time.js
 */

const JD = {
	JD2000: 2451545.0,
};

function getDT(jd) {
	return (jd - JD.JD2000) / 365250;
}

module.exports = {
	getDT,
	JD,
};
