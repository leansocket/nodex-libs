let ext = require('./ext');
ext.error();

exports.has = function(obj, field){
    for(let k in obj){
        let f = obj[k];
        if(k === field && f !== undefined && f !== null){
            return true;
        }
    }
    return false;
};

exports.has_one = function(obj, fields){
    for(let i = 0; i < fields.length; i++){
        let f = fields[i];
        if(exports.has(f)){
            return true;
        }
    }
    return false;
};

exports.has_all = function(obj, fields){
    for(let i = 0; i < fields.length; i++){
        let f = fields[i];
        if(!exports.has(f)){
            return false;
        }
    }
    return true;
};

exports.must_have_one = function(obj, fields){
    for(let i = 0; i < fields.length; i++){
        let f = fields[i];
        if(exports.has(f)){
            return;
        }
    }
    throw Error.make("ERR_FieldRequired", `Nothing is defined in the object.`);
};

exports.must_have_all = function(obj, fields){
    for(let i = 0; i < fields.length; i++){
        let f = fields[i];
        if(!exports.has(f)){
            throw Error.make("ERR_FieldRequired", `Required field '${f}' is not defined in the object.`);
        }
    }
};

exports.regs = {
    alpha: /^[a-zA-Z]+$/,
    number: /^\d+$/,
    integer: /^[-+]?\d+$/,
    string: /^[\w\W\s\S\d\D\b\B]*$/,
    float: /^[-+]?\d+(\.\d+)?$/,
    hex: /^(0x|0X)?[a-fA-F\d]+$/,
    word: /^\w+$/,
    chinese: /^[\u4E00-\u9FA5]+$/,

    username: /^\w+$/,
    password: /^[\w~!@#$%^&*()+=\-.,:{}\[\]|\\]+$/,
    email: /^[\w\-]+(\.[\w\-]+)*@[\w\-]+(\.[\w\-]+)+$/,
    url: /^[a-zA-z]+:\/\/(\w+(-\w+)*)(\.(\w+(-\w+)*))*(\?\S*)?$/,
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    ipv6: /^$/
};

exports.check = function(field, format, minlen, maxlen){
    if(field === null || field === undefined){
        throw Error.make('ERR_FieldNullOrUndefined', `field is null or undefined.`)
    }
    if(typeof(field) === 'object' || typeof(field) === 'function'){
        throw Error.make('ERR_TypeInvalid', `data-type of field is invalid.`);
    }

    let str = field.toString();

    if(typeof(format) === 'string'){
        if(format === '*'){
            // do nothing.
        }
        else {
            let reg = exports.regs[format];
            if(reg === undefined) {
                throw Error.make('ERR_FormatUndefined', `the format '${format}' is undefined.`);
            }
            if(!exports.regs[format].test(str)){
                throw Error.make('ERR_FormatInvalid', `data format of field is invalid, '${format}' expected.`);
            }
        }
    }
    else if(format instanceof RegExp && !format.test(str)){
        throw Error.make('ERR_FormatInvalid', `data format of field is invalid, '${format}' expected.`);
    }

    if(typeof(minlen) === 'number' && str.length < minlen){
        throw Error.make('ERR_FormatInvalid', `data format of field is invalid, data is too short.`);
    }

    if(typeof(maxlen) === 'number' && str.length > maxlen){
        throw Error.make('ERR_FormatInvalid', `data format of field is invalid, data is too long.`);
    }
};
