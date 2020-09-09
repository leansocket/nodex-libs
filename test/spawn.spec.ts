import { SpawnedProcess } from '../src/spawn';

test('spawn a child process and exec commands on it.', () => {
    const spawn = new SpawnedProcess({cwd: process.cwd(), env: process.env})
    spawn.post('echo',['hello word'], function(code, out, err) {
        expect(code).toBe(0)
        expect(out).toBe("hello word\n")
        expect(err).toBe('')
    });
});
