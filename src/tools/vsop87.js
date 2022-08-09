/*
 * @Description:
 * @Version: 1.0.0
 * @Author: lax
 * @Date: 2021-12-18 16:45:26
 * @LastEditors: lax
 * @LastEditTime: 2022-08-09 23:21:30
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

function ready() {
	fs.writeJSONSync(PATH("./../data/vsop87d.ven.json"), origin);
}

(async () => {
	const input = fs.createReadStream(PATH("./../data/VSOP87D.ven"));
	// line stream
	const stream = readline.createInterface({ input });
	let use;
	let index = 0;
	stream.on("line", (line) => {
		if (isTitle(line)) {
			if (index > 0 && index <= 6) {
				origin.l.push(use);
			}
			if (index > 6 && index <= 11) {
				origin.b.push(use);
			}
			if (index > 11) {
				origin.r.push(use);
			}
			use = [];
			index++;
		} else {
			// 后三组数据
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
