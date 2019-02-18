
let crypto = require("./crypto");

exports.Token = function(secret, timeout){
    if(typeof(secret) !== 'string' || secret === ''){
        secret = '^dU~sTmYV$DjC&b*';
    }
    if(typeof(timeout) !== 'number'){
        timeout = 0;
    }

    this.sign = function(data){
        let str = JSON.stringify(data);
        let sgn = crypto.md5(secret + str);
        return sgn;
    };

    this.make = function(data) {
        let pack = [
            data,
            timeout > 0 ? Math.floor(Date.now() / 1000) : 0
        ];

        let sign = this.sign(pack).substr(12, 8);
        pack.push(sign);

        let str = crypto.encode_aes_256_cbc(secret, JSON.stringify(pack));
        return crypto.encode_hex64(str);
    };

    this.check = function(token){
        let pack = null;
        try{
            let str = crypto.decode_hex64(token);
            str = crypto.decode_aes_256_cbc(secret, str);
            pack = JSON.parse(str);
        }
        catch(e){
            console.log(e.message);
        }
        if(!pack || !Array.isArray(pack) || pack.length !== 3 ||
            pack[0] === undefined ||
            pack[1] === undefined ||
            pack[2] === undefined)
        {
            return undefined;
        }

        let sign = pack[2];
        pack.pop();
        if(sign !== this.sign(pack).substr(12, 8)){
            return undefined;
        }

        let info = {
            data: pack[0],
            time: pack[1] * 1000,
            life: timeout * 1000
        };
        if(info.time > 0 && info.life > 0 && info.time + info.life < Date.now()){
            return undefined;
        }
        return info;
    };
};

exports.Code = function(length, timeout){
    if(typeof(length) !== 'number' || length <= 0){
        length = 6;
    }
    if(typeof(timeout) !== 'number'){
        timeout = 0;
    }

    let sessions = {};
    let interval = 10000;

    this.make = function(type, to){
        let k = `${type}:${to}`;
        let s = {
            type: type,
            to: to,
            code: crypto.rsod(length),
            time: Date.now(),
            life: timeout * 1000
        };
        sessions[k] = s;
        return s.code;
    };

    this.check = function(type, to){
        let key = `${type}:${to}`;
        let s = sessions[key];
        if(s){
            s.time = Date.now();
        }
        return s;
    };

    this.clear = function(){
        let now = Date.now();

        let list = [];
        for(let key in sessions){
            let s = sessions[key];
            if(now > s.time + timeout * 1000){
                list.push(key);
            }
        }

        for(let i = 0; i < list.length; i++){
            let key = list[i];
            delete sessions[key];
        }
    };

    setInterval(this.clear, interval);
};
