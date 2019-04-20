
let ext = require('./libs/ext');
for(let k in ext){
    ext[k]();
}

let load = function(name){
    let m = null;
    return function(){
        if(m !== null && m !== undefined){
            return m;
        }
        m = require(`./libs/${name}`);
        return m;
    };
};

let modules = [
    'log', 'fmt', 'iters', 'schedule', 'flakes',
    'http', 'smtp', 'db',
    'vfs', 'crypto', 'authes', 'html',
    'util',
];


for(let i = 0; i < modules.length; i++){
    let m = modules[i];
    Object.defineProperty(module.exports, m, {
        get: load(m)
    });
}
