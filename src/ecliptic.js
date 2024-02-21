/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2021-12-20 13:33:23
 * @LastEditors: lax
 * @LastEditTime: 2024-02-21 22:28:44
 * @FilePath: \tao_solar_terms\src\ecliptic.js
 */

const VSOP87D = require("@/data/json/vsop87d.ear.json");
const VSOP87D_SIMPLE = require("@/data/json/vsop87d-simple.ear.js");
const TIME = require("@/tools/time");
const Nutation = require("nutation.js");

class Ecliptic {
	constructor(jd, p = {}) {
		this.jd = jd;
		this.dt = TIME.getDT(jd);
		this.integrity = !!p.integrity;
		this.DB =
			p.db === undefined ? (this.integrity ? VSOP87D : VSOP87D_SIMPLE) : p.db;
		this.nutOptions = this.getNutationOptions(p.nutation);
		const { iau, full } = this.nutOptions;
		this.nutation = new Nutation(this.jd, iau, full);
	}

	getNutationOptions(options = {}) {
		return Object.assign({}, {}, options);
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
		const val = collection.reduce((acc, [A, B, C]) => {
			acc += parseFloat(A) * Math.cos(parseFloat(B) + parseFloat(C) * dt);
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
		const X = arr.reduceRight((acc, next) => {
			return acc * dt + this.calcPeriodicTerm(next, dt);
		}, 0);
		return X;
	}

	/**
	 * 计算日心黄经
	 * @param {*} dt
	 * @returns {rad} l
	 */
	calcSunEclipticLongitude(dt = this.dt) {
		const l = this.calcEclipticBy(this.DB.l, dt);
		return l;
	}

	/**
	 * 计算日心黄纬
	 * @param {*} dt
	 * @returns {rad} b
	 */
	calcSunEclipticLatitude(dt = this.dt) {
		const b = this.calcEclipticBy(this.DB.b, dt);
		return b;
	}

	/**
	 * 太阳到行星的距离
	 * @param {*} dt
	 * @returns {} r
	 */
	sunPlanetRadius(dt = this.dt) {
		const r = this.calcEclipticBy(this.DB.r, dt);
		return r;
	}

	/**
	 * 计算地心黄经
	 * @param {sunLongitude} 日心黄经
	 * @returns {ang} l
	 */
	calcEarEclipticLongitude(sun = this.calcSunEclipticLongitude()) {
		return this.circle(sun * this.RADIAN_ANGLE + 180);
	}

	/**
	 * 计算地心黄纬
	 * @param {sunLatitude} 日心黄纬
	 * @returns {ang} b
	 */
	calcEarEclipticLatitude(sun = this.calcSunEclipticLatitude()) {
		return this.circle(-(sun * this.RADIAN_ANGLE));
	}

	/**
	 *VSOP87->TF5坐标系 日心黄经
	 * @param {*} dt
	 * @returns {ang} offset
	 */
	FK5EclipticLongitudeOffset() {
		return -0.09033 / 3600;
	}

	/**
	 * VSOP87->TF5坐标系 日心黄纬
	 * @param {*} dt
	 * @returns {ang} offset
	 */
	FK5EclipticLatitudeOffset(l = this.calcEarEclipticLongitude()) {
		const T = this.dt * 10;
		let dash = l - T * 1.397 - 0.00031 * T * T;
		dash /= this.RADIAN_ANGLE;
		return (0.03916 * (Math.cos(dash) - Math.sin(dash))) / 3600.0;
	}

	/**
	 * 章动修正 longitude
	 * @returns
	 */
	longitudeNutationOffset() {
		return this.nutation.longitude();
	}

	/**
	 * 章动修正 latitude
	 * @returns
	 */
	latitudeNutationOffset() {
		return this.nutation.obliquity();
	}

	longitudeLightOffset() {
		// if (integrity) {
		// 	return 0;
		// }
		return -20.4898 / this.sunPlanetRadius() / 3600.0;
	}

	/**
	 * 获取太阳地心视黄经
	 * @returns
	 */
	getSunEclipticLongitude(integrity = this.integrity) {
		let l = this.calcEarEclipticLongitude();
		// ->TF5
		if (integrity) l += this.FK5EclipticLongitudeOffset();
		// ->nutation
		l += this.longitudeNutationOffset();
		// TODO光行差
		l += this.longitudeLightOffset();
		// TODO周年视差
		return l;
	}
}
Ecliptic.prototype.RADIAN_ANGLE = 180 / Math.PI;
module.exports = Ecliptic;
