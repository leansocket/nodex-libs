let path = require('path');
let fs = require('fs');

exports.abs_path = function(p){
    return p.charAt(0) === '.' ? path.join(process.cwd(), p) : p;
};

exports.check_error = function(err, ret){
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
exports.make_xdata = function(arg0, arg1){
    if(arg0 === undefined && arg1 === undefined){
        let xdata = {};
        xdata.result = 'ERR_Unknown';
        xdata.error = 'Unknown error.';
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
    if(t0 === 'object'){
        if(arg0 !== null){
            let xdata
            if (arg0 instanceof Array) {
                xdata = { data: arg0 };
            } else {
                xdata = arg0;
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
            let xdata
            if (arg1 instanceof Array) {
                xdata = { data: arg1 };
            } else {
                xdata = arg1;
            }
            if(xdata.result === undefined){
                xdata.result = 'ok';
            }
            return xdata;
        }
    }
    if(t0 === 'number' || t0 === 'string' || t0 === 'boolean'){
        let xdata = {};
        xdata.result = 'ok';
        xdata.error = '';
        if (arg0 !== 'ok') {
            xdata.data = arg0;
        }
        return xdata;
    }

    // fallback
    {
        let xdata = {};
        xdata.result = 'ERR_InvalidData';
        xdata.error = 'data is invalid.';
        return xdata;
    }
};
