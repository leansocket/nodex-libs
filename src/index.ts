
const load = function(name){
    let m = null;
    return function(){
        if(m !== null && m !== undefined){
            return m;
        }
        m = require(`./${name}`);
        return m;
    };
};

const modules = [
    'log', 'fmt', 'time', 'schedule', 'spawn', 'flakes',
    'http', 'smtp', 
    'mysql',
    'crypto', 'authes', 'html',
    'util',
];


for(let i = 0; i < modules.length; i++){
    let m = modules[i];
    Object.defineProperty(module.exports, m, {
        get: load(m)
    });
}
