let flake = require('../libs/flake');

let f = flake.create();
for(let i = 0; i < 10; i++){
    console.log(f.get());
}
