import { Token, Code, Key } from '../src/authes';

test('Test Token class', () => {
    jest.useFakeTimers()
    const SECRET = 'nodex'
    const TIMEOUT = 3600
    const initObj = {
        key: 'value'
    }

    const token = new Token(SECRET, TIMEOUT);

    const val = token.make(initObj);
    expect(typeof val).toBe('string');

    const obj = token.check(val);
    expect(obj.data).toEqual(initObj);
    
    expect(token.check('123')).toBe(undefined)

    const sign = token.sign(initObj)
    expect(sign).toBe('d5ea4507e5332844699054fd7ef9d84f')

});

test('Test Code class', () => {
    const type = 'sms';
    const to = '12345678900';

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
    const key = new Key(6, 1);
    const k = key.make(data);
    expect(k.length).toBe(6);

    const kc = key.check(k);
    expect(kc.key === k).toBeTruthy();

    key.clear()
});