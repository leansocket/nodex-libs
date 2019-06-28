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
    throw Error.make("ERR_FIELED_REQUIRED", `Nothing is defined in the object.`);
};

exports.must_have_all = function(obj, fields){
    for(let i = 0; i < fields.length; i++){
        let f = fields[i];
        if(!exports.has(f)){
            throw Error.make("ERR_FIELED_REQUIRED", `Required field '${f}' is not defined in the object.`);
        }
    }
};

exports.rules = {
    'string': {
        test: function(val) {
            return typeof(val) === 'string';
        }
    },
    'number': {
        test: function(val){
            return typeof(val) === 'number';
        }
    },
    'boolean': {
        test: function(val) {
            return typeof(val) === 'boolean';
        }
    },
    'function': {
        test: function(val) {
            return typeof(val) === 'function';
        }
    },
    'object': {
        test: function(val) {
            return typeof(val) === 'object';
        }
    },
    'array': {
        test: function(val) {
            return Array.isArray(val);
        }
    },
    'integer': {
        test: function(val) {
            return typeof(val) === 'number' && exports.rules['integer_str'].test(val);
        }
    },
    'float': {
        test: function(val) {
            return typeof(val) === 'number' && exports.rules['float_str'].test(val);
        }
    },

    'alpha': /^[a-zA-Z]+$/,
    'number_str': /^\d+$/,
    'integer_str': /^[-+]?\d+$/,
    'float_str': /^[-+]?\d+(\.\d+)?$/,
    'hex': /^(0x|0X)?[a-fA-F\d]+$/,
    'word': /^\w+$/,
    'chinese': /^[\u4E00-\u9FA5]+$/,

    'username': /^\w+$/,
    'password': /^[\w~!@#$%^&*()+=\-.,:{}\[\]|\\]+$/,
    'email': /^[\w\-]+(\.[\w\-]+)*@[\w\-]+(\.[\w\-]+)+$/,
    'url': /^[a-zA-z]+:\/\/(\w+(-\w+)*)(\.(\w+(-\w+)*))*(\?\S*)?$/,
    'ipv4': /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/,
    'ipv6': /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    'html': /^<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)$/ 
};

exports.optional = function(field, format, minlen, maxlen){
    if(field === null || field === undefined){
        return false;
    }

    if(format === '*'){
        // do nothing.
    }
    else if(typeof(format) === 'string') {
        let rule = exports.rules[format];
        if(!rule) {
            throw Error.make('ERR_FORMAT_UNDEFINED', `the format '${format}' is undefined.`);
        }
        if(!rule.test(field)){
            throw Error.make('ERR_FORMAT_INVALID', `data format of field is invalid, '${format}' expected.`);
        }
    }
    else if(format instanceof RegExp) {
        if(!format.test(field.toString())){
            throw Error.make('ERR_FORMAT_INVALID', `data format of field is invalid, '${format}' expected.`);
        }
    }
    else {
        throw Error.make('ERR_FORMAT_UNDEFINED', `the format '${format}' is undefined.`);
    }

    let length = (field) => {
        if(typeof(field.length) === 'number') {
            return field.length;
        }
        if(typeof(field.length) === 'function') {
            return field.length();
        }
        return field.toString().length;
    };

    if(typeof(minlen) === 'number' && length(field) < minlen) {
        throw Error.make('ERR_FORMAT_INVALID', `data format of field is invalid, data is too short.`);
    }

    if(typeof(maxlen) === 'number' && length(field) > maxlen) {
        throw Error.make('ERR_FORMAT_INVALID', `data format of field is invalid, data is too long.`);
    }

    return true;
};

exports.required = function(field, format, minlen, maxlen){
    if(field === null || field === undefined){
        throw Error.make('ERR_FIELD_REQUIRED', `field is null or undefined.`);
    }
    return exports.optional(field, format, minlen, maxlen);
};

exports.check = function(field, format, minlen, maxlen) {
    console.warn(`'fmt.check' is obsolete, please use 'fmt.required' instead.`);
    return exports.required(field, format, minlen, maxlen);
};
