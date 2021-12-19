/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2021-12-19 10:29:06
 * @LastEditors: lax
 * @LastEditTime: 2021-12-19 12:40:46
 * @FilePath: \tao_solar_terms\src\tools\time.js
 */

const JD = {
	JD2000: 2451545,
};
const JC = {
	JC_BASE: 2299161,
};

function getDT(jd) {
	return (jd - JD.JD2000) / 365250;
}

function isGregorianDays(year, month, day) {
	if (year < 1582) return false;

	if (year === 1582) {
		if (month < 10 || (month === 10 && day < 15)) return false;
	}

	return true;
}

/**
 * 获取儒略日
 */
function getJD(_year, _month, date, hour, minute, second) {
	let B = -2;
	let A = ~~(_year / 100);
	let month = _month;
	let year = _year;
	if (month <= 2) {
		month += 12;
		year -= 1;
	}
	if (isGregorianDays(year, month, date)) {
		B = -A + ~~(A / 4);
	}

	const result =
		~~(365.25 * year) +
		~~(30.6001 * (month + 1)) +
		B +
		1720996.5 +
		date +
		hour / 24.0 +
		minute / 1440.0 +
		second / 86400.0;
	return result;
}

function JDToDate(_JD) {
	let JDF = _JD + 0.5;
	let Z = Math.floor(JDF);
	let F = JDF - Z;
	let A;
	let a;
	if (Z < JC.JC_BASE) {
		A = Z;
	} else {
		a = Math.floor((Z - 1867216.25) / 36524.25);
		A = Z + 1 + a - Math.floor(a / 4);
	}
	let B = A + 1524;
	let C = Math.floor((B - 122.1) / 365.25);
	let D = Math.floor(365.25 * C);
	let E = Math.floor((B - D) / 30.6001);
	let day = ~~(B - D - Math.floor(30.6001 * E) + F);
	let m;
	let y;
	if (E < 14) {
		m = E - 1;
	} else if (E === 14 || E === 15) {
		m = E - 13;
	}
	if (m > 2) {
		y = C - 4716;
	} else if (m === 1 || m === 2) {
		y = C - 4715;
	}
	let h = Math.floor(F * 24);
	let min = Math.floor((F * 24 - h) * 60);
	let sec = Math.floor(((F * 24 - h) * 60 - min) * 60);
	return new Date(y, m - 1, day, h, min, sec);
}

module.exports = { isGregorianDays, JDToDate, getJD, getDT, JD, JC };
