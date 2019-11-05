let spawn = require('../libs/spawn');

let p = spawn.process();
for(let i = 0; i < 10; i++) {
    p.post(`echo`, `command ${i}`, (code, out, err) => {
        console.log(`${code === 0}: ${out}`);
    }); 
}

setTimeout(()=>{}, 1000);