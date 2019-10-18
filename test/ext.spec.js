const ext = require('../libs/ext');

test('Test ext modules', () => {
    ext.error();
    ext.math();
    ext.promise();
    
    expect(Error.make('ERROR','error').code === 'ERROR').toBeTruthy();

    const min = 0;
    const max = 10;

    const randomRangeValue = Math.randomRange(max, min);

    expect(randomRangeValue >= min && randomRangeValue < max).toBeTruthy();

    const randomRangeIntValue = Math.randomRangeInt(max, min);

    expect(randomRangeIntValue >= min && randomRangeIntValue < max && randomRangeIntValue % 1 === 0).toBeTruthy();

    const a = 3;
    const b = 5;
    expect(Math.clamp(1, a, b)).toBe(a);
    expect(Math.clamp(7, a, b)).toBe(b);

    expect(Math.min_v(1, 5, 4, 7, 2, 9, 8)).toBe(1);
    expect(Math.max_v(1, 5, 4, 7, 2, 9, 8)).toBe(9);

    expect(Math.sum(1, 2, 3, 4, 5)).toBe(15);
    expect(Math.average(1, 2, 3, 4, 5)).toBe(3);
    expect(Math.variance(1, 2, 3, 4, 5)).toBe(2);

    const cb = jest.fn();
    Promise.delay(1000).then(cb)
    jest.useFakeTimers(() => {
        expect(cb).toHaveBeenCalled();
    })
});