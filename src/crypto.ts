import crypto from 'crypto';

/**
 * 用指定hash算法计算data的hash编码。
 * @param {string} alg hash算法的名称
 * @param {string|Buffer} data 用来做hash计算的数据
 * @returns {string} data的hash值
*/
export const hash = function(alg: string, data: string | Buffer): string {
    let hash = crypto.createHash(alg);
    hash.update(data);
    return hash.digest('hex');
};

/**
 * 计算data的md5值
 * @param {string|Buffer} data 用于做md5计算的数据
 * @returns {string} data的md5值
*/
export const md5 = function(data: string | Buffer): string {
    return hash("md5", data);
};

/**
 * 计算data的sha256值
 * @param {string | Buffer} data 用于计算sha256的数据
 * @returns {string} data的sha256值
*/
export const sha256 = function (data: string | Buffer): string {
    return hash("sha256", data);
};

/**
 * 使用aes-256-cbc算法对数据进行编码
 * @param {string} key 用于加密的密钥
 * @param {string} content 被加密的数据
 * @returns {string} 加密后的密文
 */
export const encode_aes_256_cbc = function (key: string, content: string): string {
    let cipher = crypto.createCipher("aes-256-cbc", key);
    let cryptex = cipher.update(content, "utf8", "hex");
    cryptex += cipher.final("hex");
    return cryptex;
};

/**
 * 对一串使用aes-256-cbc算法加密的密文进行解码
 * @param {string} key 解密密钥
 * @param {string} content 密文数据
 * @returns {string} 解码后的数据
*/
export const decode_aes_256_cbc = function (key: string, content: string): string {
    let decipher = crypto.createDecipher("aes-256-cbc", key);
    let decryptex = decipher.update(content, "hex", "utf8");
    decryptex += decipher.final("utf8");
    return decryptex;
};

/**
 * 对数据进行base64编码
 * @param {string} content 用于base64编码的数据
 * @returns {string} base64字符串
*/
export const encode_base64 = function (content: string): string {
    return Buffer.from(content).toString('base64');
};

/**
 * 对base64编码的字符串进行解码
 * @param {string} content base64编码字符串
 * @returns {string} base64解码后的数据
*/
export const decode_base64 = function (content: string): string {
    return Buffer.from(content, 'base64').toString();
};

/**
 * 将一段十六进制的字符串进行base64编码
 * @param {string} content 十六进制字符串
 * @returns 编码后的数据
*/
export const encode_hex64 = function (content: string): string {
    return Buffer.from(content, 'hex').toString('base64');
};

/**
 * 对一段被base64编码过的十六进制字符串进行解码
 * @param {string} content base64字符串
 * @returns {string} 十六进制字符串
*/
export const decode_hex64 = function (content: string): string {
    return Buffer.from(content, 'base64').toString('hex');
};

/**
 * 获取一个随机字符串（random string）
 * @param {number} length 随机字符串的长度
 * @param {char[]} characters 随机字符串的字符表，随机字符串中的所有字符将从此自负表中随机抽取。
 * @returns {string} 随机字符串
*/
export const rs = function (len: number, characters: string[]): string {
    let str = "";
    for (let i = 0; i < len; i++) {
        let index = Math.floor(Math.random() * characters.length);
        str += characters[index];
    }
    return str;
};

/**
 * 获取一个十进制的随机数字字符串（random string of digit）
 * @param {number} len 字符串的长度
 * @returns {string} 随机十进制数字字符串
*/
export const rsod = function (len: number): string {
    let str = "";
    for (let i = 0; i < len; i++) {
        str += Math.floor(Math.random() * 10);
    }
    return str;
};

/**
 * 获取一个十六进制的随机数字字符串（random string of hex）
 * @param {number} len 字符串的长度
 * @returns {string} 随机十六进制数字字符串
*/
export const rsox = function (len: number): string {
    let characters = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'A', 'B', 'C', 'D', 'E', 'F',
    ];
    return rs(len, characters);
};

/**
 * 获取一个随机字母字符串（random string of alpha）
 * @param {number} len 字符串的长度
 * @returns {string} 随机字母字符串
*/
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

/**
 * 获取一个由数字、字母组成的随机字符串（random string of word）
 * @param {number} len 字符串的长度
 * @returns {string} 由数字、字母组成的随机字符串.
*/
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

/**
 * 获取一个由可打印字符组成的随机字符串（random string of printable)
 * @param {number} len 字符串长度
 * @returns {string} 一个由可打印字符组成的随机字符串
*/
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
