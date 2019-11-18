
exports.absolutePath = function(p) {
	return p.charAt(0) === '.' ? path.join(process.cwd(), p) : p;
}

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
    if(arg0 instanceof Error){
        let xdata = {};
        if(!arg0.code && !arg0.name){
            xdata.result = 'ERR_UNKNOWN';
        }
        else {
            let result = `${arg0.code || arg0.name}`.toUpperCase();
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
    if(arg0 !== undefined && arg0 !== null) {
        data = arg0;
    }
    else if(arg1 !== undefined && arg1 !== null) {
        data = arg1;
    }
    if(data !== undefined) {
        let xdata = {};
        xdata.result = 'ok';
        xdata.data = data;
        return xdata;
    }

    // fallback
    {
        let xdata = {};
        xdata.result = 'ERR_INVALID_XDATA';
        xdata.data = 'x-data is invalid.';
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

