
let pad = function (value, len, char) {
    let n = value.toString().length;
    while (n < len) {
        value = char + value;
        n++;
    }
    return value;
};

let Flake = function(nodeId){
    let start = Date.UTC(2019, 0, 1);
    let seq = 0;

    this.get = function(){
        seq += 1;

        let t = (Date.now() - start).toString(16);
        let n = nodeId.toString(16);
        let s = seq.toString(16);

        t = pad(t, 12, '0');
        n = pad(n, 2, '0');
        s = pad(s, 8, '0');

        return `${t}${n}${s}`;
    }
};

exports.create = function(nodeId = 0){
    if(typeof(nodeId) !== 'number'){
        nodeId = 0;
    }
    return new Flake(nodeId);
};
