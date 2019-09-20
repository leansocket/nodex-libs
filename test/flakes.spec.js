const flakes = require('../libs/flakes');

test('generate a unique value.', () => {
    const flake = flakes.create();
    const value1 = flake.get();
    const value2 = flake.get();
    expect(value1 === value2).toBeFalsy();
});