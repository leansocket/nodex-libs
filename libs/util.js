
exports.checkError = function(err, ret) {
    if(err){
        return true;
    }
    if(ret && ret.result !== undefined){
        if(ret.result !== 0 && ret.result !== true && ret.result !== 'ok'){
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
exports.makeXdata = function(arg0, arg1) {
    if(arg0 === undefined && arg1 === undefined){
        let xdata = {};
        xdata.result = 'ERR_INVALID_XDATA';
        xdata.error = 'x-data is invalid.';
        return xdata;
    }
    if(arg0 instanceof Error){
        let xdata = {};
        if(arg0.code === undefined){
            xdata.result = 'ERR_ERROR';
        }
        else {
            let codestr = arg0.code + '';
            if (codestr.startsWith('ERR_')) {
                xdata.result = codestr;
            }
            else if (codestr.startsWith('ER_')) {
                xdata.result = 'ERR_' + codestr.substr(3);
            }
            else if (codestr.startsWith('ERROR_')) {
                xdata.result = 'ERR_' + codestr.substr(6);
            }
            else {
                xdata.result = 'ERR_' + codestr;
            }
        }
        xdata.error = arg0.message;
        return xdata;
    }
    let t0 = typeof(arg0);
    let t1 = typeof(arg1);
    if(t0 === 'number' || t0 === 'string' || t0 === 'boolean'){
        let xdata = {};
        xdata.result = 'ok';
        xdata.error = '';
        if (arg0 !== 'ok') {
            xdata.data = arg0;
        }
        return xdata;
    }
    else if(t0 === 'object'){
        if(arg0 !== null){
            let xdata = arg0;
            if (arg0 instanceof Array) {
                xdata = { data: arg0 };
            }
            if(xdata.result === undefined){
                xdata.result = 'ok';
            }
            return xdata;
        }
        else if (t1 === 'string' || t1 === 'number' || t1 === 'boolean'){
            let xdata = {};
            xdata.result = 'ok';
            xdata.data = arg1;
            return xdata;
        }
        else if(t1 === 'object' && arg1 !== null){
            let xdata = arg1;
            if (arg1 instanceof Array) {
                xdata = { data: arg1 };
            }
            if(xdata.result === undefined){
                xdata.result = 'ok';
            }
            return xdata;
        }
    }

    // fallback
    {
        let xdata = {};
        xdata.result = 'ERR_INVALID_XDATA';
        xdata.error = 'x-data is invalid.';
        return xdata;
    }
};

exports.computeGeoDistance = function(lat1, lng1, lat2, lng2) {
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
