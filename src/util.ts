import path from 'path';

/**
 * 延迟，一般用法为:
 * ``` js
 * await delay(0.5) // 延迟0.5秒
 * ```
 * @param {number} time 需要延迟的时间，单位为秒。
*/
export const delay = async function (time: number): Promise<void> {
    await new Promise<void>((resolve) => {
        let timer = setTimeout(() => {
            clearTimeout(timer);
            resolve();
        }, time * 1000);
    });
}

/**
 * 获取路径p的绝对路径
 * * 如果p以 '/' 开始，返回相对于当前进程cwd的绝对路径。
*/
export const absolutePath = function (p: string) {
    const c = p.charAt(0);
    if (c === '/') {
        return path.resolve(process.cwd(), p);
    }
    if (c === '.') {
        console.warn(`util.absolutePath(${p}) is deprecated, please use util.absolutePath(/${p.substr(1)}) instead.`);
        return path.resolve(process.cwd(), p);
    }
    return path.resolve(p);
}

/**
 * 获取name的驼峰形式。如：
 * ```
 * get_user_info => getUserInfo
 * _get_user_info => GetUserInfo
 * ```
*/
export const camelCase = function (name: string): string {
    return name.replace(/_(\w)/g, (all, letter) => {
        return letter.toUpperCase();
    });
};

/**
 * 将对象obj的key全部变成驼峰形式。
*/
export const camelCaseKeys = function (obj: object): object {
    let ret = {};
    Object.keys(obj).forEach(key => {
        ret[camelCase(key)] = obj[key];
    });
    return ret;
};

/**
 * 对两个版本进行比较
 * * versionA === versionB：返回 0
 * * versionA < versionB： 返回 -1
 * * versionA > versionB： 返回 1
 * @param {string} versionA 第一个版本号字符串
 * @param {string} versionB 第二个版本号字符串
 * @return {number}
*/
export const compareVersion = function(versionA: string, versionB: string) : number {
    if (typeof versionA !== 'string') {
        console.warn(`Expected String, got ${typeof versionA}.`)
    }
    if (typeof versionB !== 'string') {
        console.warn(`Expected String, got ${typeof versionB}.`)
    }

    const arrA = versionA.split('.');
    const arrB = versionB.split('.');

    for (let i = 0; i < Math.max(arrA.length, arrB.length); i++) {
        if (arrA[i] === undefined) {
            arrA[i] = '0';
        }
        if (arrB[i] === undefined) {
            arrB[i] = '0';
        }
        if (+arrA[i] < +arrB[i]) {
            return -1;
        } if (+arrA[i] > +arrB[i]) {
            return 1;
        }
    }
    return 0;

}

/**
 * 计算地球球面上两个经纬点之间的地理距离。
*/
export const computeGeoDistance = function (lat1: number, lng1: number, lat2: number, lng2: number): number {
    let sqrt = Math.sqrt;
    let sin = Math.sin;
    let cos = Math.cos;
    let asin = Math.asin;

    let R = 6378.137;

    let RPA = Math.PI / 180.0;
    lat1 = lat1 * RPA;
    lng1 = lng1 * RPA;
    lat2 = lat2 * RPA;
    lng2 = lng2 * RPA;

    let a = (lat1 - lat2) / 2;
    let b = (lng1 - lng2) / 2;
    return R * 2 * asin(sqrt(sin(a) * sin(a) + cos(lat1) * cos(lat2) * sin(b) * sin(b)));
};

