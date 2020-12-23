import { error } from './common';

/**
 * obj中是否存在field字段
 * @param {object} obj 待检查的对象
 * @param {string} field 待检查的字段名称
 * @returns {boolean} 结果
*/
export const has = function (obj: object, field: string): boolean {
    if (!obj) {
        return false;
    }

    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        let k = keys[i];
        let f = obj[k];
        if (k === field && f !== undefined && f !== null) {
            return true;
        }
    }

    return false;
}

/**
 * 字段列表中的其中一个字段在obj中是否存在。
 * @param {object} obj 待检查的对象
 * @param {string[]} fields 待检查的字段列表
 * @returns {boolean} 结果
*/
export const hasOne = function (obj: object, fields: string[]): boolean {
    for (let i = 0; i < fields.length; i++) {
        let f = fields[i];
        if (has(obj, f)) {
            return true;
        }
    }
    return false;
}

/**
 * 字段列表中的字段在obj中是否全部存在。
 * @param {object} obj 待检查的对象
 * @param {string[]} fields 待检查的字段列表
 * @returns {boolean} 结果
*/
export const hasAll = function (obj: object, fields: string[]): boolean {
    for (let i = 0; i < fields.length; i++) {
        let f = fields[i];
        if (!has(obj, f)) {
            return false;
        }
    }
    return true;
}

/**
 * 断言字段列表fields中的字段在对象obj中至少存在一个。如果断言失败，会抛出错误。
 * @param {object} obj 待检查的对象
 * @param {string[]} fields 待检查的字段列表
*/
export const assertOne = function (obj: object, fields: string[]): void {
    for (let i = 0; i < fields.length; i++) {
        let f = fields[i];
        if (has(obj, f)) {
            return;
        }
    }
    throw error("ERR_FIELED_REQUIRED", `Nothing is defined in the object.`);
};

/**
 * 断言字段列表fields中的全部字段在对象obj中都存在。断言失败会抛出错误。
 * @param {object} obj 待检查的对象
 * @param {string[]} fields 待检查的字段列表
*/
export const assertAll = function (obj: object, fields: string[]): void {
    for (let i = 0; i < fields.length; i++) {
        let f = fields[i];
        if (!has(obj, f)) {
            throw error("ERR_FIELED_REQUIRED", `Required field '${f}' is not defined in the object.`);
        }
    }
};

/**
 * 数据格式校验规则，其中包含两类：
 * * 正则表达式
 * * 接口：{test: (val)=>boolean}
*/
export const rules = {
    'string': {
        test: function (val) {
            return typeof (val) === 'string';
        }
    },
    'number': {
        test: function (val) {
            return typeof (val) === 'number';
        }
    },
    'boolean': {
        test: function (val) {
            return typeof (val) === 'boolean';
        }
    },
    'function': {
        test: function (val) {
            return typeof (val) === 'function';
        }
    },
    'object': {
        test: function (val) {
            return typeof (val) === 'object';
        }
    },
    'array': {
        test: function (val) {
            return Array.isArray(val);
        }
    },
    'integer': {
        test: function (val) {
            return typeof (val) === 'number' && rules['integer_str'].test(val.toString());
        }
    },
    'float': {
        test: function (val) {
            return typeof (val) === 'number' && rules['float_str'].test(val.toString());
        }
    },

    'alpha': /^[a-zA-Z]+$/,
    'number_str': /^\d+$/,
    'integer_str': /^[-+]?\d+$/,
    'float_str': /^[-+]?\d+(\.\d+)?$/,
    'hex': /^(0x|0X)?[a-fA-F\d]+$/,
    'word': /^\w+$/,
    'chinese': /^[\u4E00-\u9FA5]+$/,

    'name': /^[\w-.]+$/,
    'identifier': /^[A-Za-z_]\w*$/,

    'username': /^[\w@+\-.]+$/,
    
    'password': /^[\w~!@#$%^&*()+=\-.,:{}\[\]|\\]+$/,
    'email': /^[\w\-]+(\.[\w\-]+)*@[\w\-]+(\.[\w\-]+)+$/,
    'url': /^[a-zA-z]+:\/\/(\w+(-\w+)*)(\.(\w+(-\w+)*))*(\?\S*)?$/,
    'ipv4': /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/,
    'ipv6': /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    'html': /^<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)$/
};

/**
 * 可选项检查，如果字段存在就进行数据格式校验，如果字段不存在就返回默认值。
 * @param {T} field 待检查的字段值
 * @param {string|RegExp} format 校验规则
 * @param {number} minlen 最小长度
 * @param {number} maxlen 最大长度
 * @param {T} defaultValue 默认值
 * @returns {boolean} 字段是否存在
*/
export const optional = function <T>(field: T, format: string | RegExp, minlen: number, maxlen: number, defaultValue: T): boolean {
    if (field === undefined || field === null) {
        if (defaultValue !== undefined) {
            field = defaultValue;
        }
        return false;
    }

    if (format === '*') {
        // do nothing.
    }
    else if (typeof (format) === 'string') {
        let rule = rules[format];
        if (!rule) {
            throw error('ERR_FORMAT_UNDEFINED', `the format '${format}' is undefined.`);
        }
        if (!rule.test(field)) {
            throw error('ERR_FORMAT_INVALID', `data format of field is invalid, '${format}' expected.`);
        }
    }
    else if (format instanceof RegExp) {
        if (!format.test((field as any).toString())) {
            throw error('ERR_FORMAT_INVALID', `data format of field is invalid, '${format}' expected.`);
        }
    }
    else {
        throw error('ERR_FORMAT_UNDEFINED', `the format '${format}' is undefined.`);
    }

    const length = (field) => {
        if (typeof (field.length) === 'number') {
            return field.length;
        }
        if (typeof (field.length) === 'function') {
            return field.length();
        }
        return field.toString().length;
    };

    if (typeof (minlen) === 'number' && length(field) < minlen) {
        throw error('ERR_FORMAT_INVALID', `data format of field is invalid, data is too short.`);
    }

    if (typeof (maxlen) === 'number' && length(field) > maxlen) {
        throw error('ERR_FORMAT_INVALID', `data format of field is invalid, data is too long.`);
    }

    return true;
};

/**
 * 必备项检查，如果字段存在就进行数据格式校验，如果字段不存在就抛出错误。
 * @param {T} field 待检查的字段值
 * @param {string|RegExp} format 校验规则
 * @param {number} minlen 最小长度
 * @param {number} maxlen 最大长度
 * @returns {boolean} 字段是否存在
*/
export const required = function <T>(field: T, format: string, minlen?: number, maxlen?: number): boolean {
    if (field === undefined || field === null) {
        throw error('ERR_FIELD_REQUIRED', `field is null or undefined.`);
    }
    return optional(field, format, minlen, maxlen, undefined);
};
