import util from 'util';
import chalk from 'chalk';
import { post } from './http/client';
import { sign } from './http/basic';

const cache = Symbol('cache');

/**
 * 日志模块回调函数
 * @param {string} tag 日志的前缀标签
 * @param {string} message 日志内容
 */
export type LogHandlerInfo = (tag: string, message: string) => void;

/**
 * 日志服务器配置参数
 */
export interface LogServerInfo {

	/**
	 * 日志服务器链接
	 */
	url: string,

	/**
	 * Appid
	 */
	appid: string,

	/**
	 * 密钥
	 */
	secret: string,

	/**
	 * 日志上报时间间隔
	 */
	interval?: number,
}

/**
 * 日志配置
 */
export interface LogOptions {
	/**
	 * 日志的前缀标签
	 */
	scope: string,

	/**
	 * 服务器配置
	 */
	server?: LogServerInfo,

	/**
	 * 日志回调
	 */
	handler?: LogHandlerInfo
}

/**
 * 日志内容参数
 */
interface LogInfo {
	time: string,
	tag: string,
	content: string
}

/**
 * 初始化日志模块
 * @param {string} scope 日志的前缀标签
*/
export const init = function (options: string | LogOptions): void {

	let scope, server, handler;

	if (typeof options === 'string') {
		scope = options;
	} else {
		scope = options.scope;
		server = options.server;
		handler = options.handler;
	}

	const pad2 = function (val) {
		return val < 10 ? `0${val}` : val;
	};

	const getTime = function () {
		let t = new Date();
		let Y = t.getFullYear();
		let M = pad2(t.getMonth() + 1);
		let D = pad2(t.getDate());
		let h = pad2(t.getHours());
		let m = pad2(t.getMinutes());
		let s = pad2(t.getSeconds());
		return `${Y}-${M}-${D} ${h}:${m}:${s}`;
	}

	const sendLogs = async function (logs: LogInfo[]) {

		const { appid, secret, url } = server;

		const data = {
			logs,
			scope,
			appid
		}
		data['$_appid'] = appid;
		data['$_sign'] = sign(data, secret);
		return post(url, data);
	}

	const configs = {
		log: {
			tag: 'LOG',
			style: chalk.white
		},
		info: {
			tag: 'INFO',
			style: chalk.green
		},
		notice: {
			tag: 'NOTICE',
			style: chalk.blue
		},
		warn: {
			tag: 'WARN',
			style: chalk.yellow.bold
		},
		error: {
			tag: 'ERROR',
			style: chalk.red.bold
		}
	};

	const console_log = console.log;

	console[cache] = [];

	for (let x in configs) {
		let cfg = configs[x];
		const time = getTime();
		const tag = cfg.tag
		console[x] = function () {
			let content = `[${scope}] ${time}|${tag}| ${util.format.apply(this, arguments as any)}`
			console_log(cfg.style(content));
			
			if (handler) {
				handler(tag, content);
			}

			if (server) {
				console[cache].push({
					time,
					tag,
					meta: console['meta'] || undefined,
					content: util.format.apply(this, arguments as any)
				});
				if (console[cache].length > 256) {
					sendLogs(console[cache]);
					console[cache] = [];
				}
			}
		}
	}

	if (server) {
		setInterval(() => {
			if (console[cache].length) {
				sendLogs(console[cache]);
				console[cache] = [];
			}
		}, server.interval || 6000);
	}
};
