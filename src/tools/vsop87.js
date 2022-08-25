/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2021-12-18 16:45:26
 * @LastEditors: lax
 * @LastEditTime: 2022-08-25 20:11:12
 * @FilePath: \tao_solar_terms\src\tools\vsop87.js
 */

const fs = require("fs-extra");
const path = require("path");
const readline = require("readline");
const origin = { l: [], b: [], r: [] };

function PATH(p) {
	return path.resolve(__dirname, p);
}

function isTitle(l) {
	return l.indexOf("VSOP87") === 1;
}

function LBR(l) {
	const str = l.slice(l.indexOf("VARIABLE"), l.indexOf("(LBR)"));
	if (str.includes("1")) return "l";
	if (str.includes("2")) return "b";
	if (str.includes("3")) return "r";
}

function ready() {
	fs.writeJSONSync(PATH("./../data/json/vsop87d.ear.json"), origin);
}

(async () => {
	const input = fs.createReadStream(PATH("./../data/lib/VSOP87D.ear"));
	// line stream
	const stream = readline.createInterface({ input });
	let use;
	let lbr = "";
	stream.on("line", (line) => {
		if (isTitle(line)) {
			if (lbr === "l") origin.l.push(use);
			if (lbr === "b") origin.b.push(use);
			if (lbr === "r") origin.r.push(use);
			use = [];
			lbr = LBR(line);
		} else {
			// 只取后三组数据
			const _line = line.slice(79);
			const data = _line.trim().split(/\s+/);
			use.push(data);
		}
	});

	stream.on("close", () => {
		// 最后一个集合数据单独添加
		origin.r.push(use);
		ready();
	});
})();
