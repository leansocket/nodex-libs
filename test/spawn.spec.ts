import * as spawn from '../src/spawn';
import os from 'os';

test('spawn a child process and exec commands on it.', async () => {
    const ret = await spawn.exec('echo', ['hello word']);
    expect(ret.exitcode).toBe(0)
    expect(ret.stdout).toBe("hello word" + os.EOL)
    expect(ret.stderr).toBe('')
});

test('spawn a child process and exec error commands on it.', async () => {
    try {
        await spawn.exec('echo-', ['hello word']);
    }
    catch (err) {
        expect(err).toBeDefined();
    }
});
