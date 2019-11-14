
let http = require('http');
let https = require('https');
let http2 = require('http2');
let liburl = require('url');
let query = require('querystring');

let fs = require('fs');
let path = require('path');

let ext = require('./ext');
let vfs = require('./vfs');
let util = require('./util');

ext.error();

exports.isHttps = function(url) {
    return url.indexOf('https://') === 0;
};

exports.combineUrlAndParams = function(url, data) {
    if(typeof(data) !== 'object' || data === null) {
        return url;
    }

    let params = query.stringify(data);
    if(!params || params.length <= 0){
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

exports.getRequestOptions = function(optionsOrUrl) {
    let options = undefined;

    if(typeof(optionsOrUrl) === 'object' && optionsOrUrl !== null){
        options = {
            ... optionsOrUrl
        };
    }
    else if(typeof(optionsOrUrl) === 'string' && optionsOrUrl.length > 0) {
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
exports.request = async function(options, data) {
    options = options || {};
    options.hostname = options.hostname || undefined;
    options.port = options.port || undefined;
    options.socketPath = options.socketPath || undefined;
    options.headers = options.headers || {};
    options.safe = options.safe || false;

    data = data || {};

    let content_str = JSON.stringify(data);
    let content_len = Buffer.byteLength(content_str, "utf8");

    if(options.method === 'GET') {
        options.path = exports.combineUrlAndParams(options.path, data);
    }
    else if(options.method === 'POST') {
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
        options.headers['Content-Length'] = content_len;
    }

    let onRes = async function(res) {
        return await new Promise(function(resolve, reject) {
            let body = [];

            res.on('error', (err) => {
                return reject(err);
            });
    
            res.on("data", (data) => {
                body.push(data);
            });
        
            res.on("end", () => {
                try{
                    let contentType = res.headers['content-type'].toLowerCase();
                    let type = '';
                    let charset = 'utf8';
                    if(contentType.indexOf('text') >= 0){
                        type = 'text';
                    }
                    else if(contentType.indexOf('json') >= 0){
                        type = 'json';
                    }
        
                    let content = Buffer.concat(body);
                    if(type === 'text'){
                        content = content.toString(charset);
                    }
                    else if(type === 'json'){
                        content = content.toString(charset);
                        content = JSON.parse(content);
                    }

                    return resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        content: content
                    });
                }
                catch(err){
                    return reject(err);
                }
            });
        });
    };

    return await new Promise(function(resolve, reject) {
        let proto = options.safe ? https : http;

        let req = proto.request(options, (res) => {
            onRes(res)
                .catch((err) => {
                    return reject(err);
                })
                .then((ret) => {
                    return resolve(ret);
                });
        });

        req.on('error', function (err) {
            return reject(err);
        });
    
        if(options.method === 'POST') {
            req.write(content_str);
        }
        
        req.end();
    });
};

// callback : function(err: Error, ret: {headers: map, content: Buffer})
exports.get = async function(args, data) {
    let options = exports.getRequestOptions(args);
    if(!options) {
        throw Error.make('ERR_INVALID_ARGS', 'the args of http.get is invalid.');
    }

    options.method = 'GET';

    return await exports.request(options, data);
};

// callback : function(err: Error, ret: {headers: map, content: Buffer})
exports.post = async function(opts, data) {
    let options = exports.getRequestOptions(args);
    if(!options) {
        throw Error.make('ERR_INVALID_ARGS', 'the args of http.post is invalid.');
    }

    options.method = 'POST';

    return await exports.request(options, data);
};

exports.call = async function(args, data) {
    let ret = await exports.post(args, data);
    if(!ret || ret.status !== 200 || !ret.content){
        throw Error.make(`ERR_HTTP_RPC`, `invoke http rpc failed.`);
    }
    let content = ret.content;
    if(content.result !== 'ok') {
        throw Error.make(content.result, content.data);
    }
    return content.data;
};

exports.rpc = function(base, rps) {
    const toCamelCase = function (name) {
        return name.replace(/_(\w)/g, (all, letter) => letter.toUpperCase());
    };

    let lm = {};
    Object.keys(rps).forEach(key => {
       let rm = rps[key];
        if(!Array.isArray(rm)){
            return;
        }
        rm.forEach(rp => {
            let lp = toCamelCase(rp);
            lm[lp] = async function(data){
                return await exports.call(`${base}/${key}/${rp}`, data);
            };
        });
    });
    return lm;
};

exports.webapp = function(args) {
    args = args || {};

    let fs = require('fs');
    let koa = require('koa');
    let koa_body = require('./body');
    let koa_cors = require('koa2-cors');
    let koa_router = require('koa-router');

    let app = new koa();

    app.on('error', (err, ctx) => {
        console.error(`http: error ${err.message}`);
        if(ctx){
            // nothing needed to do
        }
    });

    if(args.proxy){
        app.proxy = true;
    }

    if(args.log){
        app.use(async (ctx, next) => {
            let req = ctx.request;
            console.log(`http: ${req.ip} ${req.protocol.toUpperCase()} ${req.method} ${req.url}`);
            return next();
        });
    }

    if(args.cors){
        app.use(koa_cors());
    }
    else if(args.cda){
        console.warn(`'cda' is deprecated, please use cors instade.`);
        app.use(koa_cors());
    }

    if(args.body){
        let bodyType = typeof args.body;       
        if(bodyType === 'object'){
            app.use(koa_body(args.body));
        }
        else if(bodyType === 'function'){
            app.use(args.body);
        }
        else {
            app.use(koa_body());
        }
    }
    else if(args.body !== false){
        app.use(koa_body());
    }

    if (args.https_cert && args.https_key){
        app.listen_safely = function(){
            if(args.https_hsts){
                app.use((ctx, next) => {
                    let res = ctx.response;
                    res.set("Strict-Transport-Security", "max-age=31536000");
                    return next();
                });
            }

            let cert = fs.readFileSync(vfs.absolutePath(args.https_cert));
            let key = fs.readFileSync(vfs.absolutePath(args.https_key));
            let options = {cert: cert, key: key};

            if(args.http2 === true) {
                let server = http2.createSecureServer(options, app.callback());
                server.listen.apply(server, arguments);
            }
            else {
                let server = https.createServer(options, app.callback());
                server.listen.apply(server, arguments);
            }
        };
    }

    app.static = function(path, target){
        app.use(path, koa.static(target));
    };

    app.route = function(func){
        let router = new koa_router();
        router.use(async(ctx, next)=>{
            try{
                await next();
            }
            catch(err){
                ctx.body = util.makeXdata(err, null);
                ctx.app.emit('error', err);
            }
        });
        func(router);
        app.use(router.routes()).use(router.allowedMethods());
    };

    app.start = function(){
        if(!args){
            return;
        }
        if(args.host && args.port > 0){
            app.listen(args.port, args.host, function () {
                console.log(`http service '${args.name}' is listening on ${args.host}:${args.port}`);
            });
        }
        if(args.https_host && args.https_port > 0 && args.https_cert && args.https_key){
            app.listen_safely(args.https_port, args.https_host, function () {
                console.log(`https service '${args.name}' is listening on ${args.https_host}:${args.https_port}`);
            });
        }
    };

    return app;
};

exports.body = function(options) {
    let bodyParser = require('./body');
    return bodyParser(options);
};

exports.send = function(ctx, arg1, arg2) {
    let message = util.makeXdata(arg1, arg2);
    //console.log(`http: send ${JSON.stringify(message)}`);
    ctx.response.body = message;
};

/*
    options : {
        brotli: true,
        gzip: true,
        maxAge: 600  // s
        immutable: true,
    }
*/
exports.sendFile = async function(ctx, filepath, options) {
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

    if(options.maxAge > 0) {
        const directives = [`max-age=${options.maxAge|0}`];
        if (options.immutable) {
            directives.push('immutable');
        }
        ctx.set('Cache-Control', directives.join(','));
    }

    if (!ctx.type) {
         let type = function(file, ext) {
            return ext !== '' ? path.extname(path.basename(file, ext)) : path.extname(file)
        }
        ctx.type = type(filepath, fileext);
    }

    ctx.body = fs.createReadStream(filepath);
};

exports.error = function(ctx, err, ret) {
    if(util.checkError(err, ret)){
        exports.send(ctx, err, ret);
        return true;
    }
    return false;
};

exports.handler = function(func) {
    if(typeof(func) !== 'function'){
        throw Error.make(`ERR_INVALID_ARGS`, `the type of 'func' is not a 'async function'.`);
    }
    return async function(ctx) {
        let arg = {
            ... (ctx.params || {}),
            ... (ctx.request.query || {}),
            ... (ctx.request.body || {}),
        }
        let ret = await func(arg);
        exports.send(ctx, ret);
    };
};
