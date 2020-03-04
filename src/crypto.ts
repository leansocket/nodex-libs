let crypto = require('crypto');

export const hash = function(alg: string, data: string | Buffer): string {
    let hash = crypto.createHash(alg);
    hash.update(data);
    return hash.digest('hex');
};

export const md5 = function(data: string | Buffer): string {
    return hash("md5", data);
};

export const sha256 = function (data: string | Buffer): string {
    return hash("sha256", data);
};

export const encode_aes_256_cbc = function (key: string, content: string): string {
    let cipher = crypto.createCipher("aes-256-cbc", key);
    let cryptex = cipher.update(content, "utf8", "hex");
    cryptex += cipher.final("hex");
    return cryptex;
};

export const decode_aes_256_cbc = function (key: string, content: string): string {
    let decipher = crypto.createDecipher("aes-256-cbc", key);
    let decryptex = decipher.update(content, "hex", "utf8");
    decryptex += decipher.final("utf8");
    return decryptex;
};

export const encode_base64 = function (content: string): string {
    return Buffer.from(content).toString('base64');
};

export const decode_base64 = function (content: string): string {
    return Buffer.from(content, 'base64').toString();
};

export const encode_hex64 = function (content: string): string {
    return Buffer.from(content, 'hex').toString('base64');
};

export const decode_hex64 = function (content: string): string {
    return Buffer.from(content, 'base64').toString('hex');
};

export const rs = function (len: number, characters: string[]): string {
    let str = "";
    for (let i = 0; i < len; i++) {
        let index = Math.floor(Math.random() * characters.length);
        str += characters[index];
    }
    return str;
};

export const rsod = function (len: number): string {
    let str = "";
    for (let i = 0; i < len; i++) {
        str += Math.floor(Math.random() * 10);
    }
    return str;
};

export const rsox = function (len: number): string {
    let characters = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'A', 'B', 'C', 'D', 'E', 'F',
    ];
    return rs(len, characters);
};

export const rsoa = function (len: number): string {
    let characters = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z',

        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z',
    ];
    return rs(len, characters);
};

export const rsow = function (len: number): string {
    let characters = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',

        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z',

        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z',
    ];
    return rs(len, characters);
};

export const rsop = function (len: number): string {
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
    return rs(len, characters);
};
