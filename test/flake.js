let flake = require('../libs/flakes');

let f = flake.create();
for(let i = 0; i < 10; i++){
    console.log(f.get());
}
