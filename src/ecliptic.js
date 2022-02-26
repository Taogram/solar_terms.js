/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2021-12-20 13:33:23
 * @LastEditors: lax
 * @LastEditTime: 2022-02-26 14:06:11
 * @FilePath: \tao_solar_terms\src\ecliptic.js
 */

const VSOP87D = require("./data/vsop87d.json");
const VSOP87D_SIMPLE = require("./data/vsop87d-simple.js");
const TIME = require("./tools/time");
const Nutation = require("./nutation");

class Ecliptic {
	constructor(jd, p) {
		this.dt = TIME.getDT(jd);
		p && this.setOptions(p);
	}

	setOptions(p) {
		// 样本繁简
		this.DB = p.integrity ? VSOP87D : VSOP87D_SIMPLE;
		this.DB = p.db ? p.db : this.DB;
	}

	circle(c) {
		let result = c % 360;
		if (c < 0) result += 360;
		return result;
	}

	/**
	 * 计算周期项
	 * @param {Array} collection
	 * @param {dt} dt
	 * @returns {Number} num
	 */
	calcPeriodicTerm(collection, dt = this.dt) {
		const val = collection.reduce((acc, next) => {
			acc += Number(next[0]) * Math.cos(Number(next[1]) + Number(next[2]) * dt);
			return acc;
		}, 0);
		return val;
	}

	/**
	 * 根据X计算周期
	 * @param {*} arr
	 * @returns
	 */
	calcEclipticBy(arr, dt = this.dt) {
		let X = arr
			.map((each) => {
				return this.calcPeriodicTerm(each, dt);
			})
			.reduceRight((acc, next) => {
				return acc * dt + next;
			}, 0);
		return X;
	}

	/**
	 * 计算日心黄经
	 * @param {*} dt
	 * @returns {sunLongitude} l
	 */
	calcSunEclipticLongitude(dt = this.dt) {
		const l = this.calcEclipticBy(this.DB.l, dt);
		return l;
	}

	/**
	 * 计算地心黄经
	 * @param {sunLongitude} 日心黄经
	 * @returns {earLongitude} l
	 */
	calcEarEclipticLongitude(sun = this.calcSunEclipticLongitude()) {
		return this.circle(sun * this.RADIAN_ANGLE + 180);
	}

	/**
	 * 计算日心黄纬
	 * @param {*} dt
	 * @returns {sunLatitude} b
	 */
	calcSunEclipticLatitude(dt = this.dt) {
		const b = this.calcEclipticBy(this.DB.b, dt);
		return b;
	}

	/**
	 * 计算地心黄纬
	 * @param {sunLatitude} 日心黄纬
	 * @returns {earLatitude} b
	 */
	calcEarEclipticLatitude(sun = this.calcSunEclipticLatitude()) {
		return -(sun * this.RADIAN_ANGLE);
	}

	/**
	 * 太阳到地球的距离
	 * @param {*} dt
	 * @returns
	 */
	sunEarthRadius(dt = this.dt) {
		const r = this.calcEclipticBy(this.DB.r, dt);
		return r;
	}

	/**
	 *VSOP87->TF5坐标系 地心黄经
	 * @param {*} dt
	 * @returns
	 */
	TF5EclipticLongitudeOffset(dt = this.dt) {
		const T = dt * 10;
		const L = this.calcEarEclipticLongitude(dt);
		const B = this.calcEarEclipticLatitude(dt);
		let dash = L - T * 1.397 - 0.00031 * T * T;
		dash /= this.RADIAN_ANGLE;
		return (
			(-0.09033 +
				0.03916 *
					(Math.cos(dash) + Math.sin(dash)) *
					Math.tan((B * 3600) / this.RADIAN_ANGLE)) /
			3600.0
		);
	}

	/**
	 * VSOP87->TF5坐标系 地心黄纬
	 * @param {*} dt
	 * @returns
	 */
	TF5SunEclipticLatitudeOffset(dt = this.dt) {
		const T = dt * 10;
		const L = this.calcEarEclipticLongitude(dt);
		let dash = L - 1.397 * T - 0.00031 * T * T;
		dash /= this.RADIAN_ANGLE;
		return (0.03916 * (Math.cos(dash) - Math.sin(dash))) / 3600.0;
	}

	/**
	 * 地球章动修正
	 * @param {*} dt
	 * @returns
	 */
	earLongitudeNutationOffset(dt = this.dt) {
		const T = dt * 10;
		return new Nutation(T).offset();
	}

	/**
	 * 获取太阳地心视黄经
	 * @param {*} jd
	 * @returns
	 */
	getSunEclipticLongitude() {
		let l = this.calcEarEclipticLongitude();
		// ->TF5
		l += this.TF5EclipticLongitudeOffset();
		// ->nutation
		l += this.earLongitudeNutationOffset();
		l -= 20.4898 / this.sunEarthRadius() / 3600;
		return l;
	}
}

Ecliptic.prototype.DB = VSOP87D;
Ecliptic.prototype.RADIAN_ANGLE = 180 / Math.PI;
module.exports = Ecliptic;
