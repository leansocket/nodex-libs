import * as fmt from '../src/fmt';

test('Test fmt function', () => {
    const obj = {
        key: 'value',
        k: 'v'
    };

    expect(fmt.has(obj, 'key')).toBeTruthy();
    expect(fmt.has(obj, 't')).toBeFalsy();

    expect(fmt.hasOne(obj, ['key'])).toBeTruthy();
    expect(fmt.hasOne(obj, ['k'])).toBeTruthy();
    expect(fmt.hasOne(obj, ['k', 'key'])).toBeTruthy();
    expect(fmt.hasOne(obj, ['t'])).toBeFalsy();

    expect(fmt.hasAll(obj, ['key', 'k'])).toBeTruthy();
    expect(fmt.hasAll(obj, ['key', 't'])).toBeFalsy();
    expect(fmt.hasAll(obj, ['t'])).toBeFalsy();

    expect(fmt.assertOne(obj, ['key', 't'])).toBeUndefined();
    expect(fmt.assertAll(obj, ['key', 'k'])).toBeUndefined();

})

test('Test fmt rules module', () => {
    expect(fmt.required('abc','string', 1, 3)).toBeTruthy();
    expect(fmt.required(123, 'number', 1, 3)).toBeTruthy();
    expect(fmt.required(true, 'boolean')).toBeTruthy();
    expect(fmt.required(jest.fn, 'function')).toBeTruthy();
    expect(fmt.required({}, 'object')).toBeTruthy();
    expect(fmt.required(123, 'integer')).toBeTruthy();
    expect(fmt.required(123.123, 'float')).toBeTruthy();

    expect(fmt.required('abcABC', 'alpha')).toBeTruthy();
    expect(fmt.required('123', 'number_str')).toBeTruthy();
    expect(fmt.required('123', 'integer_str')).toBeTruthy();
    expect(fmt.required('123.123', 'float_str')).toBeTruthy();
    expect(fmt.required(0xffa123, 'hex')).toBeTruthy();
    expect(fmt.required('hello', 'word')).toBeTruthy();
    expect(fmt.required('你好', 'chinese')).toBeTruthy();
})