
let zlib = require('zlib');
let iconv = require('iconv-lite');

exports.decompress = async function(res) {
    return await new Promise((resolve, reject)=>{
        if(res.headers['Content-Encoding'] === 'gzip'){
            zlib.gunzip(res.content, (err, ret)=>{
                if(err){
                    return reject(err);
                }
                return resolve({headers:headers, content:ret});
            });
        }
        else{
            return resolve(res);
        }
    });
};

exports.decode = async function(res) {
    return await new Promise((resolve, reject)=>{
        let content_type = res.headers['content-type'];
        if(!content_type){
            return resolve({headers:headers, content:content.toString("utf8")});
        }

        let eq = content_type.lastIndexOf('=');
        let charset = content_type.substr(eq+1);
        if(!charset){
            return resolve({headers:headers, content:content.toString("utf8")});
        }

        let str = iconv.decode(content, charset);
        return resolve({headers:headers, content:str});
    });
};

exports.load = async function(res) {
    res = await exports.decompress(res);
    res = await exports.decode(res);
    return res;
};
