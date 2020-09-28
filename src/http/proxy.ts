
import net from 'net';
import url from 'url';
import http from 'http';
import https from 'https';

const assert = require('assert');
const debug = require('debug')('proxy');
debug.request = require('debug')('proxy ← ← ←');
debug.response = require('debug')('proxy → → →');
debug.proxyRequest = require('debug')('proxy ↑ ↑ ↑');
debug.proxyResponse = require('debug')('proxy ↓ ↓ ↓');

// hostname
const hostname = require('os').hostname();

type ProxyServer = http.Server | https.Server;

interface ProxyOptions {
    name: string;
}

/**
 * Sets up an `http.Server` or `https.Server` instance with the necessary
 * "request" and "connect" event listeners in order to make the server act as an
 * HTTP proxy.
 *
 * @param {http.Server|https.Server} proxyServer
 * @param {Object} proxyOptions
 * @api public
 */

export function setup(proxyServer: ProxyServer, proxyOptions: ProxyOptions) {
    if (!proxyServer) {
        proxyServer = http.createServer();
    }

    proxyOptions = proxyOptions || {
        name: 'proxy',
    }

    proxyServer.on('request', (req, res) => {
        onrequest(proxyServer, proxyOptions, req, res);
    });
    proxyServer.on('connect', (req, socket, head) => {
        onconnect(proxyServer, proxyOptions, req, socket, head);
    });

    return proxyServer;
}

/**
 * 13.5.1 End-to-end and Hop-by-hop Headers
 *
 * Hop-by-hop headers must be removed by the proxy before passing it on to the
 * next endpoint. Per-request basis hop-by-hop headers MUST be listed in a
 * Connection header, (section 14.10) to be introduced into HTTP/1.1 (or later).
 */

let hopByHopHeaders = [
    'Connection',
    'Keep-Alive',
    'Proxy-Authenticate',
    'Proxy-Authorization',
    'TE',
    'Trailers',
    'Transfer-Encoding',
    'Upgrade'
];

// create a case-insensitive RegExp to match "hop by hop" headers
let isHopByHop = new RegExp('^(' + hopByHopHeaders.join('|') + ')$', 'i');

/**
 * Iterator function for the request/response's "headers".
 * Invokes `fn` for "each" header entry in the request.
 *
 * @api private
 */

function eachHeader(obj, fn) {
    if (Array.isArray(obj.rawHeaders)) {
        // ideal scenario... >= node v0.11.x
        // every even entry is a "key", every odd entry is a "value"
        let key = null;
        obj.rawHeaders.forEach(function (v) {
            if (key === null) {
                key = v;
            } else {
                fn(key, v);
                key = null;
            }
        });
    }
    else {
        // otherwise we can *only* proxy the header names as lowercase'd
        let headers = obj.headers;
        if (!headers) return;
        Object.keys(headers).forEach(function (key) {
            let value = headers[key];
            if (Array.isArray(value)) {
                // set-cookie
                value.forEach(function (val) {
                    fn(key, val);
                });
            }
            else {
                fn(key, value);
            }
        });
    }
}

/**
 * HTTP GET/POST/DELETE/PUT, etc. proxy requests.
 */
function onrequest(proxyServer, proxyOptions, req, res) {
    debug.request('%s %s HTTP/%s ', req.method, req.url, req.httpVersion);
    let socket = req.socket;

    // pause the socket during authentication so no data is lost
    socket.pause();

    authenticate(proxyServer, req, function (err, auth) {
        socket.resume();
        if (err) {
            // an error occured during login!
            res.writeHead(500);
            res.end((err.stack || err.message || err) + '\n');
            return;
        }
        if (!auth) {
            return requestAuthorization(req, res);
        }

        let parsed = url.parse(req.url);
        if ('http:' != parsed.protocol) {
            // only "http://" is supported, "https://" should use CONNECT method
            res.writeHead(400);
            res.end('Only "http:" protocol prefix is supported\n');
            return;
        }

        // Proxy Request Options
        let options: any = {
            method: req.method,
            ...parsed,
        }

        if (proxyServer.localAddress) {
            options.localAddress = proxyServer.localAddress;
        }

        // ProxyReq Options
        const headers = options.headers = {};
        const via = `1.1 ${hostname} (${proxyOptions.name})`;

        let hasXForwardedFor = false;
        let hasVia = false;

        eachHeader(req, function (key, value) {
            debug.request('Request Header: "%s: %s"', key, value);
            let keyLower = key.toLowerCase();

            if (!hasXForwardedFor && 'x-forwarded-for' === keyLower) {
                // append to existing "X-Forwarded-For" header
                // http://en.wikipedia.org/wiki/X-Forwarded-For
                hasXForwardedFor = true;
                value += ', ' + socket.remoteAddress;
                debug.proxyRequest(
                    'appending to existing "%s" header: "%s"',
                    key,
                    value
                );
            }

            if (!hasVia && 'via' === keyLower) {
                // append to existing "Via" header
                hasVia = true;
                value += ', ' + via;
                debug.proxyRequest(
                    'appending to existing "%s" header: "%s"',
                    key,
                    value
                );
            }

            if (isHopByHop.test(key)) {
                debug.proxyRequest('ignoring hop-by-hop header "%s"', key);
            }
            else {
                let v = headers[key];
                if (Array.isArray(v)) {
                    v.push(value);
                }
                else if (null != v) {
                    headers[key] = [v, value];
                }
                else {
                    headers[key] = value;
                }
            }
        });

        // add "X-Forwarded-For" header if it's still not here by now
        // http://en.wikipedia.org/wiki/X-Forwarded-For
        if (!hasXForwardedFor) {
            headers['X-Forwarded-For'] = socket.remoteAddress;
            debug.proxyRequest(
                'adding new "X-Forwarded-For" header: "%s"',
                headers['X-Forwarded-For']
            );
        }

        // add "Via" header if still not set by now
        if (!hasVia) {
            headers['Via'] = via;
            debug.proxyRequest('adding new "Via" header: "%s"', headers['Via']);
        }

        let gotResponse = false;
        let proxyReq = http.request(options);
        debug.proxyRequest('%s %s HTTP/1.1 ', proxyReq.method, proxyReq.path);

        proxyReq.on('response', function (proxyRes) {
            debug.proxyResponse('HTTP/1.1 %s', proxyRes.statusCode);
            gotResponse = true;

            const headers = {};
            eachHeader(proxyRes, function (key, value) {
                debug.proxyResponse(
                    'Proxy Response Header: "%s: %s"',
                    key,
                    value
                );
                if (isHopByHop.test(key)) {
                    debug.response('ignoring hop-by-hop header "%s"', key);
                }
                else {
                    let v = headers[key];
                    if (Array.isArray(v)) {
                        v.push(value);
                    }
                    else if (null != v) {
                        headers[key] = [v, value];
                    }
                    else {
                        headers[key] = value;
                    }
                }
            });

            debug.response('HTTP/1.1 %s', proxyRes.statusCode);
            res.writeHead(proxyRes.statusCode, headers);
            proxyRes.pipe(res);
            res.on('finish', onfinish);
        });

        proxyReq.on('error', function (err) {
            debug.proxyResponse(
                'proxy HTTP request "error" event\n%s',
                err.stack || err
            );

            cleanup();

            if (gotResponse) {
                debug.response(
                    'already sent a response, just destroying the socket...'
                );
                socket.destroy();
            }
            else if ('ENOTFOUND' == (err as any).code) {
                debug.response('HTTP/1.1 404 Not Found');
                res.writeHead(404);
                res.end();
            }
            else {
                debug.response('HTTP/1.1 500 Internal Server Error');
                res.writeHead(500);
                res.end();
            }
        });

        // if the client closes the connection prematurely,
        // then close the upstream socket
        function onclose() {
            debug.request(
                'client socket "close" event, aborting HTTP request to "%s"',
                req.url
            );
            proxyReq.abort();
            cleanup();
        }
        socket.on('close', onclose);

        function onfinish() {
            debug.response('"finish" event');
            cleanup();
        }

        function cleanup() {
            debug.response('cleanup');
            socket.removeListener('close', onclose);
            res.removeListener('finish', onfinish);
        }

        req.pipe(proxyReq);
    });
}

/**
 * HTTP CONNECT proxy requests.
 */

function onconnect(proxyServer, proxyOptions, req, socket, head) {
    debug.request('%s %s HTTP/%s ', req.method, req.url, req.httpVersion);
    assert(
        !head || 0 == head.length,
        '"head" should be empty for proxy requests'
    );

    // create the `res` instance for this request since Node.js
    // doesn't provide us with one :(
    // XXX: this is undocumented API, so it will break some day.
    let res = new http.ServerResponse(req);
    res.shouldKeepAlive = false;
    res.chunkedEncoding = false;
    res.useChunkedEncodingByDefault = false;
    res.assignSocket(socket);

    // called for the ServerResponse's "finish" event
    // XXX: normally, node's "http" module has a "finish" event listener that would
    // take care of closing the socket once the HTTP response has completed, but
    // since we're making this ServerResponse instance manually, that event handler
    // never gets hooked up, so we must manually close the socket...
    function onfinish() {
        debug.response('response "finish" event');
        res.detachSocket(socket);
        socket.end();
    }
    res.once('finish', onfinish);

    let gotResponse = false;

    // define request socket event listeners
    socket.on('close', function onclientclose() {
        debug.request('HTTP request %s socket "close" event', req.url);
    });

    socket.on('end', function onclientend() {
        debug.request('HTTP request %s socket "end" event', req.url);
    });

    socket.on('error', function onclienterror(err) {
        debug.request(
            'HTTP request %s socket "error" event:\n%s',
            req.url,
            err.stack || err
        );
    });


    // pause the socket during authentication so no data is lost
    socket.pause();

    authenticate(proxyServer, req, function (err, auth) {
        socket.resume();

        if (err) {
            res.writeHead(500);
            res.end((err.stack || err.message || err) + '\n');
            return;
        }
        if (!auth) {
            return requestAuthorization(req, res);
        }

        let parts = req.url.split(':');
        let host = parts[0];
        let port = +parts[1];
        let opts = { host: host, port: port };

        debug.proxyRequest('connecting to proxy target %j', opts);

        const target = net.connect(opts);
        target.on('connect', () => {
            debug.proxyResponse('proxy target %s "connect" event', req.url);
            debug.response('HTTP/1.1 200 Connection established');
            gotResponse = true;
            res.removeListener('finish', onfinish);

            res.writeHead(200, 'Connection established');
            res.flushHeaders();

            // relinquish control of the `socket` from the ServerResponse instance
            // nullify the ServerResponse object, so that it can be cleaned
            // up before this socket proxying is completed
            res.detachSocket(socket);
            res = null;

            // pipe streams
            socket.pipe(target);
            target.pipe(socket);
        });

        target.on('close', () => {
            debug.proxyResponse('proxy target %s "close" event', req.url);
            socket.destroy();
        });

        target.on('end', () => {
            debug.proxyResponse('proxy target %s "end" event', req.url);
        });

        target.on('error', (err) => {
            debug.proxyResponse(
                'proxy target %s "error" event:\n%s',
                req.url,
                err.stack || err
            );
            if (gotResponse) {
                debug.response(
                    'already sent a response, just destroying the socket...'
                );
                socket.destroy();
            }
            else if ('ENOTFOUND' == (err as any).code) {
                debug.response('HTTP/1.1 404 Not Found');
                res.writeHead(404);
                res.end();
            }
            else {
                debug.response('HTTP/1.1 500 Internal Server Error');
                res.writeHead(500);
                res.end();
            }
        });
    });
}

/**
 * Checks `Proxy-Authorization` request headers. Same logic applied to CONNECT
 * requests as well as regular HTTP requests.
 *
 * @param {http.Server} server
 * @param {http.ServerRequest} req
 * @param {Function} fn callback function
 * @api private
 */
function authenticate(server, req, fn) {
    let hasAuthenticate = 'function' == typeof server.authenticate;
    if (hasAuthenticate) {
        debug.request('authenticating request "%s %s"', req.method, req.url);
        server.authenticate(req, fn);
    }
    else {
        // no `server.authenticate()` function, so just allow the request
        fn(null, true);
    }
}

/**
 * Sends a "407 Proxy Authentication Required" HTTP response to the `socket`.
 *
 * @api private
 */

function requestAuthorization(req, res) {
    // request Basic proxy authorization
    debug.response(
        'requesting proxy authorization for "%s %s"',
        req.method,
        req.url
    );

    // TODO: make "realm" and "type" (Basic) be configurable...
    let realm = 'proxy';

    let headers = {
        'Proxy-Authenticate': 'Basic realm="' + realm + '"'
    };
    res.writeHead(407, headers);
    res.end();
}