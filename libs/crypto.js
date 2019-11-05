let crypto = require('crypto');

exports.hash = function(alg, data){
    let hash = crypto.createHash(alg);
    hash.update(data);
    return hash.digest('hex');
};

exports.md5 = function (data) {
    return exports.hash("md5", data);
};

exports.sha256 = function (data) {
    return exports.hash("sha256", data);
};

exports.encode_aes_256_cbc = function(key, content){
    let cipher = crypto.createCipher("aes-256-cbc", key);
    let cryptex = cipher.update(content, "utf8", "hex");
    cryptex += cipher.final("hex");
    return cryptex;
};

exports.decode_aes_256_cbc = function(key, content){
    let decipher = crypto.createDecipher("aes-256-cbc", key);
    let decryptex = decipher.update(content, "hex", "utf8");
    decryptex += decipher.final("utf8");
    return decryptex;
};

exports.encode_base64 = function (content) {
    return Buffer.from(content).toString('base64');
};

exports.decode_base64 = function (content) {
    return Buffer.from(content, 'base64').toString();
};

exports.encode_hex64 = function(content){
    return Buffer.from(content, 'hex').toString('base64');
};

exports.decode_hex64 = function(content){
    return Buffer.from(content, 'base64').toString('hex');
};

exports.rs = function(len, characters){
    let str = "";
    for (let i = 0; i < len; i++) {
        let index = Math.floor(Math.random() * characters.length);
        str += characters[index];
    }
    return str;
};

exports.rsod = function(len){
    let str = "";
    for (let i = 0; i < len; i++) {
        str += Math.floor(Math.random() * 10);
    }
    return str;
};

exports.rsox = function(len){
    let characters = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'A', 'B', 'C', 'D', 'E', 'F',
    ];
    return exports.rs(len, characters);
};

exports.rsoa = function(len){
    let characters = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z',

        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z',
    ];
    return exports.rs(len, characters);
};

exports.rsow = function(len){
    let characters = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',

        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z',

        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z',
    ];
    return exports.rs(len, characters);
};

exports.rsop = function(len){
    let characters = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',

        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z',

        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z',

        '~', '!', '#', '$', '%', '^', '*', '(', ')', '+',
        '-', '_', '<', '>', '[', ']', '{', '}', '|', '/',
    ];
    return exports.rs(len, characters);
};
