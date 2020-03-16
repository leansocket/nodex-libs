
const http = require('http');
const https = require('https');
const http2 = require('http2');
const liburl = require('url');
const query = require('querystring');

const fs = require('fs');
const path = require('path');

const { error } = require('./common');
const cop = require('./cop');
const util = require('./util');

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
    port?: number;
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
export const isHttps = function (url: string): boolean {
    return url.indexOf('https://') === 0;
};

/**
 * 将data对象的数据以key=value的方式合并到url之后，并返回合并之后的url。
*/
export const combineUrlAndParams = function (url: string, data: object): string {
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

            if (options.method === 'POST') {
                req.write(content_seq);
            }

            req.end();
        });
    }

    let resp = async function (res): Promise<HttpResponseOptions> {
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
export const rpc = function (base: string, rps: { [key: string]: string[] }): object {
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
 * koa中间件类型
*/
export type WebMiddleWare = (ctx: any, next: any) => any;

/**
 * Web应用参数
*/
export interface WebAppArgs {
    /**
     * 名称
    */
    name: string;
    /**
     * 主机，IP或域名
    */
    host: string;
    /**
     * 端口号
    */
    port: number;
    /**
     * https服务主机，IP或域名
    */
    https_host?: string;
    /**
     * https服务端口
    */
    https_port?: number;
    /**
     * https服务证书文件路径
    */
    https_cert?: string;
    /**
     * https服务证书密钥文件路径
     */
    https_key?: string;
    /**
     * 是否开启hsts
    */
    https_hsts?: boolean;
    /**
     * 是否开启http2
    */
    http2?: boolean;
    /**
     * 是否启用请求日志记录功能，开启后会在控制台输出请求信息。
    */
    log?: boolean;
    /**
     * 是否开启跨域控制
    */
    cors?: boolean;
    /**
     * 是否开启代理模式
    */
    proxy?: boolean;
    /**
     * body解析器设置
     * * false：禁用body解析。
     * * object：配置body解析器参数，详细参考body模块说明。
     * * middleware：使用自定义中间件自行解析body。
     * * 其他情况：使用默认的body解析设置。
    */
    body?: boolean | object | WebMiddleWare;
};
/**
 * 创建一个基于koa2的web应用。
*/
export const webapp = function (args: WebAppArgs): any {
    args = args || {
        name: 'http',
        host: '127.0.0.1',
        port: 80
    };

    let fs = require('fs');
    let koa = require('koa');
    let koa_body = require('./body');
    let koa_cors = require('koa2-cors');
    let koa_router = require('koa-router');

    let app = new koa();

    app.on('error', (err, ctx) => {
        console.error(`http: error ${err.message}`);
        if (ctx) {
            // nothing needed to do
        }
    });

    if (args.proxy) {
        app.proxy = true;
    }

    if (args.log) {
        app.use(async (ctx, next) => {
            let req = ctx.request;
            console.log(`http: ${req.ip} ${req.protocol.toUpperCase()} ${req.method} ${req.url}`);
            return next();
        });
    }

    if (args.cors) {
        app.use(koa_cors());
    }

    if (args.body !== false) {
        let bodyType = typeof args.body;
        if (bodyType === 'object') {
            app.use(koa_body(args.body));
        }
        else if (bodyType === 'function') {
            app.use(args.body);
        }
        else {
            app.use(koa_body());
        }
    }

    if (args.https_cert && args.https_key) {
        app.listen_safely = function () {
            if (args.https_hsts) {
                app.use((ctx, next) => {
                    let res = ctx.response;
                    res.set("Strict-Transport-Security", "max-age=31536000");
                    return next();
                });
            }

            let cert = fs.readFileSync(util.absolutePath(args.https_cert));
            let key = fs.readFileSync(util.absolutePath(args.https_key));
            let options = { cert: cert, key: key };

            if (args.http2 === true) {
                let server = http2.createSecureServer(options, app.callback());
                server.listen.apply(server, arguments);
            }
            else {
                let server = https.createServer(options, app.callback());
                server.listen.apply(server, arguments);
            }
        };
    }

    app.static = function (path, target) {
        app.use(path, koa.static(target));
    };

    app.route = function (func) {
        let router = new koa_router();
        router.use(async (ctx, next) => {
            try {
                await next();
            }
            catch (err) {
                ctx.body = cop.make(err, null);
                ctx.app.emit('error', err);
            }
        });
        func(router);
        app.use(router.routes()).use(router.allowedMethods());
    };

    app.start = function () {
        if (!args) {
            return;
        }
        if (args.host && args.port > 0) {
            app.listen(args.port, args.host, function () {
                console.log(`http service '${args.name}' is listening on ${args.host}:${args.port}`);
            });
        }
        if (args.https_host && args.https_port > 0 && args.https_cert && args.https_key) {
            app.listen_safely(args.https_port, args.https_host, function () {
                console.log(`https service '${args.name}' is listening on ${args.https_host}:${args.https_port}`);
            });
        }
    };

    return app;
};

/**
 * 创建一个body解析器中间件，详细选项设置请参考body模块。
*/
export const body = function (options: object): WebMiddleWare {
    let bodyParser = require('./body');
    return bodyParser(options);
};

/**
 * 发送http响应
*/
export const send = function (ctx: any, arg1: any, arg2?: any) {
    let message = cop.make(arg1, arg2);
    //console.log(`http: send ${JSON.stringify(message)}`);
    ctx.response.body = message;
};

/**
 * 发送文件的选项
*/
export type SendFileOptions = {
    /**
     * 是否启用brotli，brotli相关信息请自行参考文献。
    */
    brotli: boolean;
    /**
     * 是否启用gzip压缩
    */
    gzip: boolean;
    /**
     * http缓存控制的maxAge属性
    */
    maxAge: number;
    /**
     * http缓存控制的immutable属性
    */
    immutable: boolean;
}
/**
 * 发送响应文件。
*/
export const sendFile = async function (ctx, filepath: string, options: SendFileOptions): Promise<void> {
    let fileext = '';
    if (options.brotli !== false && ctx.acceptsEncodings('br', 'identity') === 'br' && (fs.existsSync(filepath + '.br'))) {
        ctx.set('Content-Encoding', 'br');
        ctx.res.removeHeader('Content-Length');
        filepath = `${filepath}.br`;
        fileext = '.br';
    }
    else if (options.gzip !== false && ctx.acceptsEncodings('gzip', 'identity') === 'gzip' && (fs.existsSync(filepath + '.gz'))) {
        ctx.set('Content-Encoding', 'gzip');
        ctx.res.removeHeader('Content-Length');
        filepath = `${filepath}.gz`;
        fileext = '.gz';
    }

    let stats = fs.statSync(filepath);

    ctx.set('Content-Length', stats.size);
    ctx.set('Last-Modified', stats.mtime.toUTCString());

    if (options.maxAge > 0) {
        const directives = [`max-age=${options.maxAge | 0}`];
        if (options.immutable) {
            directives.push('immutable');
        }
        ctx.set('Cache-Control', directives.join(','));
    }

    if (!ctx.type) {
        let type = function (file, ext) {
            return ext !== '' ? path.extname(path.basename(file, ext)) : path.extname(file)
        }
        ctx.type = type(filepath, fileext);
    }

    ctx.body = fs.createReadStream(filepath);
};

/**
 * 将func函数包装成一个中间件
*/
export const handler = function (func: (args: object) => any): WebMiddleWare{
    if (typeof (func) !== 'function') {
        throw error(`ERR_INVALID_ARGS`, `the type of 'func' is not a 'async function'.`);
    }
    return async function (ctx) {
        let args = {
            ... (ctx.params || {}),
            ... (ctx.request.query || {}),
            ... (ctx.request.body || {}),
        }
        let ret = await func(args);
        send(ctx, ret);
    };
};
