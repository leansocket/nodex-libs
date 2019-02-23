
let http = require('http');
let https = require('https');
let liburl = require('url');
let query = require('querystring');

let util = require('./util');

exports.is_https = function(url){
    return url.indexOf('https://') === 0;
};

exports.combine_url_and_params = function(url, data){
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

let on_res = async function(res, callback) {
    let body = [];

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

            let data = {
                status: res.statusCode,
                headers: res.headers,
                content: content
            };
            callback(null, data);
        }
        catch(err){
            return callback(err, null);
        }
    });
};

/**
 args : {
    host: '',
    port: 80,
    path: '/do_sth',
    safe: true,
    json: true
 }
 args : string
 * */
let do_get = function(args, data, callback){
    let options = null;
    let safe = false;
    if(typeof(args) === 'object' && args !== null){
        options = {
            hostname: args.host,
            port: args.port || 80,
            path: exports.combine_url_and_params(args.path, data),
            method: 'GET',
            headers: args.headers || undefined
        };
        safe = args.safe === true;
    }
    else if(typeof(args) === 'string' && args.length > 0) {
        options = exports.combine_url_and_params(args, data);
        safe = exports.is_https(args);
    }
    else {
        let err = new Error('invalid args.');
        err.code = 'ERR_InvalidArgs';
        console.log(`http: ${err.message}`);
        return callback(err, null);
    }

    if(typeof(data) === 'function'){
        callback = data;
    }

    let proto = safe ? https : http;

    let req = proto.request(options, (res)=>{
        return on_res(res, callback);
    });

    req.on('error', function (err) {
        console.log(`http: ${err.message}`);
        return callback(err, null);
    });

    req.end();
};

/**
 args : {
    host: '',
    port: 80,
    path: '/do_sth',
    safe: true,
    json: true
 }
 args : string
 * */
let do_post = function (args, data, callback) {
    let options = null;
    let safe = false;
    let content_str = JSON.stringify(data);
    let content_len = Buffer.byteLength(content_str, "utf8");

    if(typeof(args) === 'object' && args !== null){
        options = {
            hostname: args.host,
            port: args.port || 80,
            path: args.path,
            method: 'POST',
            headers: args.headers || undefined
        };
        safe = args.safe === true;
    }
    else if(typeof(args) === 'string' && args.length > 0) {
        let urlinfo = liburl.parse(args);
        options = {
            hostname: urlinfo.hostname,
            port: urlinfo.port,
            path: urlinfo.path,
            method: 'POST'
        };
        safe = exports.is_https(args);
    }
    else {
        let err = new Error('invalid args.');
        err.code = 'ERR_InvalidArgs';
        console.log(`http: ${err.message}`);
        return callback(err, null);
    }

    if(options.headers === undefined || options.headers === null){
        options.headers = {
            'Content-Type': 'application/json',
            'Content-Length': content_len,
        };
    }

    if(typeof(data) === 'function'){
        callback = data;
    }

    let proto = safe ? https : http;

    let req = proto.request(options, (res)=>{
        on_res(res, callback);
    });

    req.on('error', function (e) {
        console.log(`http: ${e.message}`);
        callback(e, null);
    });

    req.write(content_str);
    req.end();
};

// callback : function(err: Error, ret: {headers: map, content: Buffer})
exports.get = function (args, data) {
    return new Promise((resolve, reject)=>{
        do_get(args, data, (error, content)=>{
            if(error){
                return reject(error);
            }
            return resolve(content);
        });
    });
};

// callback : function(err: Error, ret: {headers: map, content: Buffer})
exports.post = async function(args, data){
    return await new Promise((resolve, reject)=>{
        do_post(args, data, (error, content)=>{
            if(error){
                return reject(error);
            }
            return resolve(content);
        });
    });
};

exports.webapp = function(args){
    let fs = require('fs');
    let koa = require('koa');
    let koa_body = require('./body');
    let koa_cors = require('koa2-cors');
    let koa_router = require('koa-router');

    let app = new koa();

    app.on('error', (err, ctx) => {
        console.error(`http: error ${err.message}`);
        if(ctx){
            // print nothing.
        }
    });

    let bodyParserEnabled = true;
    if(args && args.body === false){
        bodyParserEnabled = false;
    }
    if(bodyParserEnabled){
        app.use(koa_body(args.body));
    }

    // todo: cookie
    // todo: session

    if(args && args.log){
        app.use(async (ctx, next) => {
            let req = ctx.request;
            console.log(`http: ${req.ip} ${req.protocol.toUpperCase()} ${req.method} ${req.url}`);
            return next();
        });
    }

    if(args && (args.cors || args.cda)){
        app.use(koa_cors());
    }

    if (args && args.https_cert && args.https_key){
        app.listen_safely = function(){
            if(args.https_hsts){
                app.use((ctx, next) => {
                    let res = ctx.response;
                    res.set("Strict-Transport-Security", "max-age=31536000");
                    return next();
                });
            }

            let cert = fs.readFileSync(util.abs_path(args.https_cert));
            let key = fs.readFileSync(util.abs_path(args.https_key));
            let options = {cert: cert, key: key};

            let server = https.createServer(options, app.callback());
            server.listen.apply(server, arguments);
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
                ctx.body = util.make_xdata(err, null);
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

exports.send = function (ctx, arg1, arg2) {
    let message = util.make_xdata(arg1, arg2);
    //console.log(`http: send ${JSON.stringify(message)}`);
    ctx.response.body = message;
};

exports.error = function(ctx, err, ret){
    if(util.check_error(err, ret)){
        exports.send(ctx, err, ret);
        return true;
    }
    return false;
};
