import { create } from '../src/flakes';

test('generate a unique value.', () => {
    const flake = create();
    const value1 = flake.get();
    const value2 = flake.get();
    expect(value1 === value2).toBeFalsy();
});