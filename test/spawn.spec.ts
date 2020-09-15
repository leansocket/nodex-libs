import { SpawnedProcess } from '../src/spawn';
import os from 'os';

test('spawn a child process and exec commands on it.', () => {
    const spawn = new SpawnedProcess({cwd: process.cwd(), env: process.env})
    spawn.post('echo',['hello word'], function(code, out, err) {
        expect(code).toBe(0)
        expect(out).toBe("hello word"+os.EOL)
        expect(err).toBe('')
    });
});
