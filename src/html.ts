
import zlib from 'zlib';
import iconv from 'iconv-lite';
import escapeHtml from 'escape-html';

/**
 * HTTP响应数据
*/
type HttpResponseOptions = {
    status: number;
    headers: { [key: string]: string|number };
    content: string | Buffer;
};

/**
 * 对http响应数据进行解压。如果http响应数据采用了gzip压缩，就进行解压，否则什么都不做。
*/
export const decompress = async function (res: HttpResponseOptions): Promise<HttpResponseOptions> {
    return await new Promise((resolve, reject) => {
        if (res.headers['Content-Encoding'] !== 'gzip') {
            return resolve(res);
        }
        zlib.gunzip(res.content, (err, ret) => {
            if (err) {
                return reject(err);
            }
            return resolve({ 
                status: res.status,
                headers: res.headers, 
                content: ret 
            });
        });
    });
};

/**
 * 对http响应数据进行解码。如果http响应数据采用了特殊编码格式就进行解码，否则什么都不做。
*/
export const decode = async function (res: HttpResponseOptions): Promise<HttpResponseOptions> {
    return await new Promise((resolve) => {
        let charset = '';
        let content_type = res.headers['content-type'].toString();
        if (content_type) {
            let eq = content_type.lastIndexOf('=');
            charset = content_type.substr(eq + 1);
        }

        if (!charset) {
            return resolve({
                status: res.status,
                headers: res.headers,
                content: res.content.toString("utf8")
            });
        }

        let str = iconv.decode(Buffer.from(res.content), charset);
        return resolve({ 
            status: res.status,
            headers: res.headers, 
            content: str 
        });
    });
};

/**
 * 对HTML字符串中的特殊字符进行转义。
*/
export const escape = async function (html: string): Promise<string> {
    return await escapeHtml(html);
};
