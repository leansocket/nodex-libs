import query from 'querystring';
import { md5 } from '../crypto';

/**
 * HTTP头结构
 */
export type HttpHeaders = { [key: string]: string | number };

/**
 * HTTP请求选项
*/
export interface HttpRequestOptions {
    /**
     * 主机名，可以是IP地址或域名。
    */
    hostname?: string;
    /**
     * 端口号
    */
    port?: string;
    /**
     * UNIX套接字路径
    */
    socketPath?: string;
    /**
     * HTTP请求头
    */
    headers?: HttpHeaders;
    /**
     * 是否是安全请求。如果是，则启用HTTPS。
    */
    safe?: boolean;
    /**
     * 请求方法
    */
    method?: 'GET' | 'POST';
    /**
     * 请求资源路径，形如: /user/info?id=1
    */
    path?: string;
    /**
     * 超时时间，单位毫秒，默认5000
     */
    timeout?: number
}

/**
 * HTTP响应数据
*/
export interface HttpResponseOptions {
    /**
     * HTTP状态码，详细请参考HTTP协议规范。
    */
    status: number;
    /**
     * 响应头
    */
    headers: HttpHeaders;
    /**
     * 响应数据，json会被自动解析
     */
    content: any;
}

/**
 * 判断url是否是https
*/
export function isHttps(url: string): boolean {
    return url.indexOf('https://') === 0;
};

/**
 * 将data对象的数据以key=value的方式合并到url之后，并返回合并之后的url。
*/
export function combineUrlAndParams(url: string, data: query.ParsedUrlQueryInput): string {
    if (typeof (data) !== 'object' || data === null) {
        return url;
    }

    let params = query.stringify(data);
    if (!params || params.length <= 0) {
        return url;
    }

    let ret = url;
    let index = url.indexOf("?", 0);
    if (index < 0 || index >= url.length) {
        ret = url + "?" + params;
    }
    else if (index < url.length - 1) {
        ret = url + "&" + params;
    }
    else {
        ret = url + params;
    }
    return ret;
};

/**
 * 对http请求数据签名，内部采用MD5算法生成签名指纹。
 * @param {object} data 用于签名的http请求数据。
 * @param {string} secret 用于签名的密钥。
 * @returns {string} 签名指纹
 */
export function sign(data: object, secret: string): string {
    const str = Object.keys(data).sort().map(
        key => `${key}=${data[key]}`
    ).join('&');
    return md5(str + secret);
}
