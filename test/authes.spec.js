const { Token, Code, Key } = require('../libs/authes');

test('Test Token class', () => {
    const initObj = {
        key: 'value'
    }

    const token = new Token();

    const val = token.make(initObj);
    expect(typeof val).toBe('string');

    const obj = token.check(val);
    expect(obj.time).toBe(0);
    expect(obj.life).toBe(0);
    expect(obj.data).toEqual(initObj);
});

test('Test Code class', () => {
    const type = 123;
    const to = 123;

    const code = new Code(6, 0);
    const co = code.make(type, to);
    expect(co.length).toBe(6);

    const ce = code.check(type, to);
    expect(ce.code === co).toBeTruthy();
});

test('Test Key class', () => {
    const data = {
        key: 'value'
    }
    const key = new Key(6, 0);
    const k = key.make(data);
    expect(k.length).toBe(6);

    const kc = key.check(k);
    expect(kc.key === k).toBeTruthy();
});