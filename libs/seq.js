
let fs = require('fs');

let Seq = function(){
    let value = 0;

    this.set = function(v){
        value = v;
    };

    this.get = function(){
        return value;
    };

    this.next = function(){
        value ++;
        return value;
    }
};

let seqs = {};

module.exports = function(scope){
    let s = seqs[scope];
    if(s === undefined){
        s = new Seq();
        seqs[scope] = s;
    }
    return s;
};

