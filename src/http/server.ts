
import https from 'https';
import http2 from 'http2';
import fs from 'fs';
import path from 'path';

import koa from 'koa';
import koaRouter from 'koa-router';
import koaCors from 'koa2-cors';
import koaStaticRouter from 'koa-static-router';
import koaBody from '../body';
import uaParser from 'ua-parser-js';

import { error } from '../common';
import * as cop from '../cop';
import * as util from '../util';

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
    /**
     * 通用的/_ping路由配置
     * * 启用此项配置会添加一个默认的通用的/_ping路由。
     * * /_ping路由通常用于网络诊断服务检查此服务可用性。
     * * 所有以 /_ 开始的都是内部路由。
    */
    ping?: boolean;
};

/**
 * WebApp
 * * Web服务端应用，从Koa继承而来。
 */
export class WebApp extends koa {
    /**
     * https监听。
     */
    public listenSafely: (...args: any) => void;

    /**
     * 静态资源服务。
     */
    public static: (...args: any) => void;

    /**
     * 路由注册。
     */
    public route: (func: (router: koaRouter) => void) => void;

    /**
     * 启动服务
     */
    public start: () => void;
}

/**
 * 创建一个基于koa2的web应用。
*/
export const webapp = function (args: WebAppArgs): WebApp {
    args = args || {
        name: 'http',
        host: '127.0.0.1',
        port: 80
    };

    const app = new WebApp();

    app.on('error', (err, ctx) => {
        if (ctx) {
            const req = ctx.request;
            const ua = uaParser(ctx.headers['user-agent']);
            const meta = {
                time: Date.now(),
                ip: req.ip,
                protocol: req.protocol.toUpperCase(),
                method: req.method,
                url: req.url,
                device: ua.device,
                cpu: ua.cpu,
                os: ua.os,
                client: ua.browser ? {
                    browser: ua.browser,
                    engine: ua.engine,
                } : null,
            };
            console['meta'] = meta;
        }
        console.error(err);
        console['meta'] = null;
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
        app.use(koaCors());
    }

    if (args.body !== false) {
        let bodyType = typeof args.body;
        if (bodyType === 'object') {
            app.use(koaBody(args.body));
        }
        else if (bodyType === 'function') {
            app.use(args.body as any);
        }
        else {
            app.use(koaBody());
        }
    }

    app.listenSafely = function () {
        if (!args.https_cert || !args.https_key) {
            throw error('ERR_NOT_IMPLEMENTS',
                `the method WebApp.listenSafely is not implements, please configure it.`);
        }

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
            server.listen.apply(server, arguments as any);
        }
        else {
            let server = https.createServer(options, app.callback());
            server.listen.apply(server, arguments as any);
        }
    };

    app.static = function (...args) {
        app.use(koaStaticRouter(args))
    };

    app.route = function (func: (router: koaRouter) => void): void {
        let router = new koaRouter();

        router.use(async (ctx, next) => {
            try {
                await next();
            }
            catch (err) {
                ctx.body = cop.make(err, null);
                ctx.app.emit('error', err, ctx);
            }
        });

        if (args.ping) {
            router.post('/_ping', async function (ctx, next) {
                ctx.response.body = cop.make(true);
            });
        }

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
            app.listenSafely(args.https_port, args.https_host, function () {
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
    return koaBody(options);
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
export const handler = function (func: (args: object) => any): WebMiddleWare {
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
