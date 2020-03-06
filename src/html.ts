
let zlib = require('zlib');
let iconv = require('iconv-lite');
let escapeHtml = require('escape-html');

type HttpResponse = {
    headers: { [key: string]: string };
    content: string | Buffer;
};

export const decompress = async function (res: HttpResponse): Promise<HttpResponse> {
    return await new Promise((resolve, reject) => {
        if (res.headers['Content-Encoding'] !== 'gzip') {
            return resolve(res);
        }
        zlib.gunzip(res.content, (err, ret) => {
            if (err) {
                return reject(err);
            }
            return resolve({ headers: res.headers, content: ret });
        });
    });
};

export const decode = async function (res: HttpResponse): Promise<HttpResponse> {
    return await new Promise((resolve) => {
        let charset = '';
        let content_type = res.headers['content-type'];
        if (content_type) {
            let eq = content_type.lastIndexOf('=');
            charset = content_type.substr(eq + 1);
        }

        if (!charset) {
            return resolve({
                headers: res.headers,
                content: res.content.toString("utf8")
            });
        }

        let str = iconv.decode(res.content, charset);
        return resolve({ headers: res.headers, content: str });
    });
};

export const load = async function (res: HttpResponse): Promise<HttpResponse> {
    res = await exports.decompress(res);
    res = await exports.decode(res);
    return res;
};

export const escape = async function (html: string): Promise<string> {
    return await escapeHtml(html);
};
