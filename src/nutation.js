/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2022-02-26 13:39:00
 * @LastEditors: lax
 * @LastEditTime: 2022-06-29 23:40:58
 * @FilePath: \tao_solar_terms\src\nutation.js
 */
const nutation = require("./data/nutation.js");
const TIME = require("./tools/time");

/**
 * @class 章动
 */
class Nutation {
	constructor(JDE, p = {}) {
		this.T = TIME.getJulianCentury(JDE);
		this.D = this.getD();
		this.M = this.getM();
		this._M = this.get_M();
		this.F = this.getF();
		this.O = this.getO();
		this.coefficient = 0.0001;
		this.nutation = p.nutation || nutation;
		this.RADIAN_ANGLE = 180 / Math.PI;
	}

	offset(T = this.T) {
		const result = this.nutation.reduce((acc, [D, M, _M, F, O, sin1, sin2]) => {
			let argument =
				this.D * D + this.M * M + this._M * _M + this.F * F + this.O * O;
			argument /= this.RADIAN_ANGLE;

			return acc + (sin1 + sin2 * T) * Math.sin(argument);
		}, 0);
		return (result * this.coefficient) / 3600;
	}

	/**
	 * 平距角-日月对地心角的距离
	 * @param {*} T
	 * @returns
	 */
	getD(T = this.T) {
		return (
			297.85036 + 455267.11148 * T - 0.0019142 * T * T + (T * T * T) / 189474.0
		);
	}

	/**
	 * 太阳(地球)平近点角
	 * @param {*} T
	 * @returns
	 */
	getM(T = this.T) {
		return (
			357.52772 + 35999.05034 * T - 0.0001603 * T * T - (T * T * T) / 300000.0
		);
	}

	/**
	 * 月球平近点角
	 * @param {*} T
	 * @returns
	 */
	get_M(T = this.T) {
		return (
			134.96298 + 477198.867398 * T + 0.0086972 * T * T + (T * T * T) / 56250
		);
	}

	/**
	 * 月球纬度参数
	 * @param {*} T
	 * @returns
	 */
	getF(T = this.T) {
		return (
			93.27191 + 483202.017538 * T - 0.0036825 * T * T + (T * T * T) / 327270
		);
	}

	/**
	 * 黄道与月球平轨道升交点黄经，从Date黄道平分点开始测量
	 * @param {*} T
	 * @returns
	 */
	getO(T = this.T) {
		return (
			125.04452 - 1934.136261 * T - 0.0020708 * T * T + (T * T * T) / 450000
		);
	}
}

module.exports = Nutation;
