
import http from 'http';
import https from 'https';
import liburl from 'url';

import { error } from '../common';
import * as util from '../util';

import {
    HttpRequestOptions, 
    HttpResponseOptions,
    isHttps,
    combineUrlAndParams
} from './basic';

/**
 * 将url解析成通用的请求选项参数。
*/
export const getRequestOptions = function (optionsOrUrl: string | HttpRequestOptions): HttpRequestOptions {
    if(typeof(optionsOrUrl) === 'object') {
        return optionsOrUrl;
    }
    else if (typeof (optionsOrUrl) === 'string' && optionsOrUrl.length > 0) {
        let urlinfo = liburl.parse(optionsOrUrl);
        return {
            hostname: urlinfo.hostname,
            port: urlinfo.port,
            path: urlinfo.path,
            safe: isHttps(optionsOrUrl),
        };
    }

    return null;
};

/**
 * 发起一次HTTP请求
*/
export const request = async function (options: HttpRequestOptions, data: any): Promise<HttpResponseOptions> {
    options = options || {};
    options.headers = options.headers || {};
    options.timeout = options.timeout || undefined;

    data = data || {};

    let content_seq: string | Buffer = '';
    let content_len: number = 0;
    if (typeof (data) === 'object') {
        content_seq = JSON.stringify(data);
        content_len = Buffer.byteLength(content_seq, "utf8");
    }
    else if (typeof (data) === 'string' || Buffer.isBuffer(data)) {
        content_seq = data;
        content_len = Buffer.byteLength(content_seq);
    }

    if (options.method === 'GET') {
        options.path = combineUrlAndParams(options.path, data);
    }
    else if (options.method === 'POST') {
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
        options.headers['Content-Length'] = content_len;
    }

    let send = async function () {
        return await new Promise(function (resolve, reject) {
            let proto = options.safe ? https : http;

            let req = proto.request(options, (res) => {
                return resolve(res)
            });

            req.on('error', function (err) {
                return reject(err);
            });

            req.on('timeout', () => {
                req.abort();
                return resolve(resp({ status: 408, headers: {}, content: {} }))
            })

            if (options.method === 'POST') {
                req.write(content_seq);
            }

            req.end();
        });
    }

    let resp = async function (res): Promise<HttpResponseOptions> {
        if (res && res.status && res.headers && res.content) {
            return res;
        }

        return await new Promise(function (resolve, reject) {
            let body = [];

            res.on('error', (err) => {
                return reject(err);
            });

            res.on("data", (data) => {
                body.push(data);
            });

            res.on("end", () => {
                try {
                    let contentType = res.headers['content-type'].toLowerCase();
                    let type = '';
                    let charset = 'utf8';
                    if (contentType.indexOf('text') >= 0) {
                        type = 'text';
                    }
                    else if (contentType.indexOf('json') >= 0) {
                        type = 'json';
                    }

                    let content: any = Buffer.concat(body);
                    if (type === 'text') {
                        content = content.toString(charset);
                    }
                    else if (type === 'json') {
                        content = content.toString(charset);
                        content = JSON.parse(content);
                    }

                    return resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        content: content
                    });
                }
                catch (err) {
                    return reject(err);
                }
            });
        });
    };

    let res = await send();
    let ret = await resp(res);
    return ret;
};

/**
 * 发起一次HTTP的GET请求。
*/
export const get = async function (args: string | HttpRequestOptions, data: any): Promise<HttpResponseOptions> {
    let options = getRequestOptions(args);
    if (!options) {
        throw error('ERR_INVALID_ARGS', 'the args of http.get is invalid.');
    }

    options.method = 'GET';

    return await request(options, data);
};

/**
 * 发起一次HTTP的POST请求。
*/
export const post = async function (args: string | HttpRequestOptions, data: any): Promise<HttpResponseOptions> {
    let options = getRequestOptions(args);
    if (!options) {
        throw error('ERR_INVALID_ARGS', 'the args of http.post is invalid.');
    }

    options.method = 'POST';

    return await request(options, data);
};

/**
 * 调用一次HTTP接口。HTTP接口统一采用POST方式进行通讯。
*/
export const call = async function (args: string | HttpRequestOptions, data: any): Promise<any> {
    let ret = await post(args, data);
    if (!ret || ret.status !== 200 || !ret.content) {
        throw error(`ERR_HTTP_RPC`, `invoke http rpc failed.`);
    }
    let content = ret.content;
    if (content.result !== 'ok') {
        throw error(content.result, content.data);
    }
    return content.data;
};

/**
 * 定义一组以base地址开头的接口列表，返回接口对象。接口对象会被转换成驼峰命名。
*/
export const makeRPC = function (base: string, rps: { [key: string]: string[] }): object {
    let lm = {};
    Object.keys(rps).forEach(key => {
        let rm = rps[key];
        if (!Array.isArray(rm)) {
            return;
        }
        rm.forEach(rp => {
            let lp = util.camelCase(rp);
            lm[lp] = async function (data) {
                return await call(`${base}/${key}/${rp}`, data);
            };
        });
    });
    return lm;
};

/**
 * 定义一组以base地址开头的接口列表，返回接口对象。接口对象会被转换成驼峰命名。
*/
export const rpc = function (base: string, rps: { [key: string]: string[] }): object {
    console.warn(`http.rpc is deprecated, please use http.makeRPC instead.`);
    return makeRPC(base, rps)
}
