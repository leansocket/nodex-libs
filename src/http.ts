
let http = require('http');
let https = require('https');
let http2 = require('http2');
let liburl = require('url');
let query = require('querystring');

let fs = require('fs');
let path = require('path');

let { error } = require('./common');
let util = require('./util');

export type HttpHeaders = { [key: string]: string | number };
export type HttpContent = string | Buffer;

export interface HttpRequestOptions {
    hostname?: string;
    port?: number;
    socketPath?: string;
    headers?: HttpHeaders;
    safe?: boolean;
    method?: 'GET' | 'POST';
    path?: string;
}

export interface HttpResponseOptions {
    status: number;
    headers: HttpHeaders;
    content: HttpContent;
}

export const isHttps = function (url: string): boolean {
    return url.indexOf('https://') === 0;
};

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

export const getRequestOptions = function (optionsOrUrl: string | HttpRequestOptions): HttpRequestOptions {
    let options: HttpRequestOptions = undefined;

    if (typeof (optionsOrUrl) === 'string' && optionsOrUrl.length > 0) {
        let urlinfo = liburl.parse(optionsOrUrl);
        options = {
            hostname: urlinfo.hostname,
            port: urlinfo.port,
            path: urlinfo.path,
            safe: exports.isHttps(optionsOrUrl),
        };
    }

    return options;
};

/**
 * startup a http request.
 * @param options: {...http.requestOptions, safe: boolean}
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
        options.path = exports.combineUrlAndParams(options.path, data);
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

                    let content: HttpContent = Buffer.concat(body);
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

// callback : function(err: Error, ret: {headers: map, content: Buffer})
export const get = async function (args: string | HttpRequestOptions, data: any): Promise<HttpResponseOptions> {
    let options = getRequestOptions(args);
    if (!options) {
        throw error('ERR_INVALID_ARGS', 'the args of http.get is invalid.');
    }

    options.method = 'GET';

    return await request(options, data);
};

// callback : function(err: Error, ret: {headers: map, content: Buffer})
export const post = async function (args: string | HttpRequestOptions, data: any): Promise<HttpResponseOptions> {
    let options = exports.getRequestOptions(args);
    if (!options) {
        throw error('ERR_INVALID_ARGS', 'the args of http.post is invalid.');
    }

    options.method = 'POST';

    return await exports.request(options, data);
};

export const call = async function (args: string | HttpRequestOptions, data: any): Promise<any> {
    let ret = await exports.post(args, data);
    if (!ret || ret.status !== 200 || !ret.content) {
        throw error(`ERR_HTTP_RPC`, `invoke http rpc failed.`);
    }
    let content = ret.content;
    if (content.result !== 'ok') {
        throw error(content.result, content.data);
    }
    return content.data;
};

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

exports.webapp = function (args: any): any {
    args = args || {};

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
    else if (args.cda) {
        console.warn(`'cda' is deprecated, please use cors instade.`);
        app.use(koa_cors());
    }

    if (args.body) {
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
    else if (args.body !== false) {
        app.use(koa_body());
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
                ctx.body = util.makeXdata(err, null);
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

export const body = function (options: object): (ctx: any, next: any) => Promise<any> {
    let bodyParser = require('./body');
    return bodyParser(options);
};

export const send = function (ctx: any, arg1: any, arg2?: any) {
    let message = util.makeXdata(arg1, arg2);
    //console.log(`http: send ${JSON.stringify(message)}`);
    ctx.response.body = message;
};

export type SendFileOptions = {
    brotli: boolean;
    gzip: boolean;
    maxAge: number;
    immutable: boolean;
}
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

export const handler = function (func: (args: object) => any): (ctx: any) => Promise<void> {
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
