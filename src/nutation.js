/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2022-02-26 13:39:00
 * @LastEditors: lax
 * @LastEditTime: 2022-08-01 23:22:33
 * @FilePath: \tao_solar_terms\src\nutation.js
 */
const ASTRONOMICAL_REVISE = require("@/data/nutation/ASTRONOMICAL_REVISE.js");
const TIME = require("@/tools/time");
const IAU1980 = require("@/algorithm/nutation/IAU1980.js");

/**
 * @class 章动
 */
class Nutation {
	constructor(JDE, ALGO = IAU1980, NUTATION = ASTRONOMICAL_REVISE) {
		this.algo = ALGO;
		this.T = TIME.getJulianCentury(JDE);
		this.D = this.getD();
		this.l = this.getL();
		this.l_ = this.getL_();
		this.F = this.getF();
		this.O = this.getO();
		this.coefficient = 0.0001;
		this.nutation = NUTATION;
		this.RADIAN_ANGLE = 180 / Math.PI;
	}

	/**
	 *
	 * @param {JC} T
	 * @returns {angle} nutation
	 */
	offset(T = this.T) {
		const result = this.nutation.reduce((acc, row) => {
			const [l, l_, F, D, O] = row;
			let argument =
				this.l * l + this.l_ * l_ + this.F * F + this.D * D + this.O * O;
			argument /= this.RADIAN_ANGLE;

			return acc + this.algo.calc(T, argument, row);
		}, 0);
		return (result * this.coefficient) / 3600;
	}

	/**
	 * 月球平近点角
	 * @param {*} T
	 * @returns
	 */
	getL(T = this.T) {
		return this.algo.l(T);
	}

	/**
	 * 太阳(地球)平近点角
	 * @param {*} T
	 * @returns
	 */
	getL_(T = this.T) {
		return this.algo.l_(T);
	}

	/**
	 * 月球平升交角距
	 * @param {*} T
	 * @returns
	 */
	getF(T = this.T) {
		return this.algo.F(T);
	}

	/**
	 * 平距角-日月对地心角的距离
	 * @param {*} T
	 * @returns
	 */
	getD(T = this.T) {
		return this.algo.D(T);
	}

	/**
	 * 黄道与月球平轨道升交点黄经，从Date黄道平分点开始测量
	 * @param {*} T
	 * @returns
	 */
	getO(T = this.T) {
		return this.algo.O(T);
	}
}

module.exports = Nutation;
