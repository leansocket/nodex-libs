
let next_step = function(iter, onIterate, onComplete){
    if(iter.end()){
        if(typeof(onComplete) === 'function'){
            onComplete();
            return;
        }
    }

    let value = iter.value();
    if(typeof(onIterate) === 'function'){
        onIterate(value);
    }

    iter.move();
};

/**
 * @param iter: iterator of a collection.
 * @param onIterate: function(node:object, next:function())
 * @param onComplete: function()
 * */
exports.iterate = function(iter, onIterate, onComplete){
    let on_it = function(n){
        if(typeof(onIterate) === 'function'){
            onIterate(n, ()=>{
                next_step(iter, on_it, on_ok);
            });
        }
    };

    let on_ok = function(){
        if(typeof(onComplete) === 'function'){
            onComplete();
        }
    };

    next_step(iter, on_it, on_ok);
};

/**
 * @param iter: iterator of a collection.
 * @param interval: float, miliseconds for async-loop.
 * @param onIterate: function(node:object, next:function())
 * @param onComplete: function()
 * */
exports.iterate_async = function(iter, interval, onIterate, onComplete){
    iter.status = 'ready';

    let on_it = function(n){
        iter.status = 'running';
        if(typeof(onIterate) === 'function'){
            onIterate(n, ()=>{
                iter.status = 'sleeping'
            });
        }
    };

    let on_ok = function(){
        iter.status = 'done';
        if(typeof(onComplete) === 'function'){
            onComplete();
        }
    };

    let timer = undefined;
    timer = setInterval(()=>{
        if(iter.status === 'ready'){
            next_step(iter, on_it, on_ok);
        }
        else if(iter.status === 'sleeping'){
            next_step(iter, on_it, on_ok);
        }
        else if(iter.status === 'done'){
            clearInterval(timer);
            timer = undefined;
        }
    }, interval);
};

exports.array_iter = function(array){
    if(!(this instanceof exports.array_iter)){
        return new exports.array_iter(array);
    }

    let index = 0;

    this.end = function(){
        return index >= array.length;
    };

    this.move = function(){
        index ++;
    };

    this.value = function(){
        return array[index];
    };
};

exports.map_iter = function(map){
    if(!(this instanceof exports.map_iter)){
        return new exports.map_iter(map);
    }

    let index = 0;

    this.end = function(){
        return index >= Object.keys(map).length;
    };

    this.move = function(){
        index ++;
    };

    this.value = function(){
        let k = Object.keys(map)[index];
        let v = map[k];
        return {k:k, v:v};
    };
};

exports.slice_iter = function(array, slice){
    if(!(this instanceof exports.slice_iter)){
        return new exports.slice_iter(array, slice);
    }

    let l = 0;
    let r = l + slice;

    this.end = function(){
        return l >= array.length;
    };

    this.move = function(){
        l = r;
        r = l + slice <= array.length ? l + slice : array.length;
    };

    this.value = function(){
        return array.slice(l, r);
    };
};
