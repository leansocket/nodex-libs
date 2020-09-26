
import chalk from 'chalk';

/**
 * 初始化日志模块
 * @param {string} scope 日志的前缀标签
*/
export const init = function (scope: string): void {

	let pad2 = function (val) {
		return val < 10 ? `0${val}` : val;
	};

	let time = function () {
		let t = new Date();
		let Y = t.getFullYear();
		let M = pad2(t.getMonth() + 1);
		let D = pad2(t.getDate());
		let h = pad2(t.getHours());
		let m = pad2(t.getMinutes());
		let s = pad2(t.getSeconds());
		return `${Y}/${M}/${D} ${h}:${m}:${s}`;
	}

	let tostr = function (message) {
		if (message === undefined) {
			return 'undefined';
		}
		if (message === null) {
			return 'null';
		}
		let type = typeof (message);
		if (type === 'object') {
			return JSON.stringify(message);
		}
		return message.toString();
	};

	let tolog = function (level, ...message) {
		let logstr = `${level}> ${time()} [${scope}]`;
		message.forEach(msg => {
			logstr += ` ${tostr(msg)}`;
		});
		return logstr;
	};

	let configs = {
		log: {
			level: 'L',
			style: chalk.white
		},
		info: {
			level: 'I',
			style: chalk.green
		},
		notice: {
			level: 'N',
			style: chalk.blue
		},
		warn: {
			level: 'W',
			style: chalk.yellow.bold
		},
		error: {
			level: 'E',
			style: chalk.red.bold
		}
	};

	let console_log = console.log;

	for (let x in configs) {
		let cfg = configs[x];
		console[x] = function () {
			let str = tolog(cfg.level, ...arguments);
			console_log(cfg.style(str));
		};
	}
};
