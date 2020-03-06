const path = require('path');

export const delay = async function (time: number): Promise<void> {
    await new Promise((resolve) => {
        let timer = setTimeout(() => {
            clearTimeout(timer);
            resolve();
        }, time * 1000);
    });
}

export const absolutePath = function (p: string) {
    return p.charAt(0) === '.' ? path.join(process.cwd(), p) : p;
}

export const camelCase = function (name: string): string {
    return name.replace(/_(\w)/g, (all, letter) => {
        return letter.toUpperCase();
    });
};
export const camelCaseKeys = function (obj: object): object {
    let ret = {};
    Object.keys(obj).forEach(key => {
        ret[camelCase(key)] = obj[key];
    });
    return ret;
};

export const checkError = function (err: Error, ret: any) {
    if (err) {
        return true;
    }
    if (ret && ret.result !== undefined) {
        if (ret.result !== 0 && ret.result !== true && ret.result !== 'ok') {
            return true;
        }
    }
    return false;
};

/*
* make_xdata(err);
* make_xdata(ret);
* make_xdata(null, ret);
* */
export const makeXdata = function (arg0: any, arg1: any) {
    if (arg0 instanceof Error) {
        let xdata: any = {};
        if (!arg0.name) {
            xdata.result = 'ERR_UNKNOWN';
        }
        else {
            let result = `${arg0.name}`.toUpperCase();
            if (result.startsWith('ERR_')) {
                xdata.result = result;
            }
            else if (result.startsWith('ER_')) {
                xdata.result = 'ERR_' + result.substr(3);
            }
            else if (result.startsWith('ERROR_')) {
                xdata.result = 'ERR_' + result.substr(6);
            }
            else {
                xdata.result = 'ERR_' + result;
            }
        }
        xdata.data = arg0.message;
        return xdata;
    }

    let data = undefined;
    if (arg0 !== undefined && arg0 !== null) {
        data = arg0;
    }
    else if (arg1 !== undefined && arg1 !== null) {
        data = arg1;
    }
    if (data !== undefined) {
        let xdata: any = {};
        xdata.result = 'ok';
        xdata.data = data;
        return xdata;
    }

    // fallback
    {
        let xdata: any = {};
        xdata.result = 'ERR_INVALID_XDATA';
        xdata.data = 'x-data is invalid.';
        return xdata;
    }
};

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

