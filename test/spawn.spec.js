let spawn = require('../libs/spawn');

test('spawn a child process and exec commands on it.', () => {
    let p = spawn.process();
    for(let i = 0; i < 10; i++) {
        p.post(`echo`, `command '${i}'`, (code, out, err) => {
            expect(code === 0 && out === `command ${i}`).toBeTruthy();
        }); 
    }
});
