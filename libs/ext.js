
module.exports = {
    error: function(){
        Error.make = function(name, message){
            let err = new Error(message);
            err.name = name;
            return err;
        };
    },

    math: function(){
        Math.randomRange = function(min, max){
            return min + Math.random() * (max - min);
        };

        Math.randomRangeInt = function(min, max){
            return Math.floor(Math.randomRange(min, max));
        };

        Math.clamp = function (x, a, b) {
            if(x < a) x = a;
            else if(x > b) x = b;
            return x;
        };

        Math.min_v = function(...array){
            let min = array[0];
            for(let i = 0; i < array.length; i++){
                if(min > array[i]){
                    min = array[i];
                }
            }
            return min;
        };

        Math.max_v = function(...array){
            let max = array[0];
            for(let i = 0; i < array.length; i++){
                if(max < array[i]){
                    max = array[i];
                }
            }
            return max;
        };

        Math.min_iv = function(...array){
            let min = array[0];
            let index = 0;
            for(let i = 0; i < array.length; i++){
                if(min > array[i]){
                    min = array[i];
                    index = i;
                }
            }
            return {i: index, v: min};
        };

        Math.max_iv = function(...array){
            let max = array[0];
            let index = 0;
            for(let i = 0; i < array.length; i++){
                if(max < array[i]){
                    max = array[i];
                    index = i;
                }
            }
            return {i: index, v: max};
        };

        Math.sum = function(...array){
            let sum = 0;
            for(let i = 0; i < array.length; i++){
                sum += array[i];
            }
            return sum;
        };

        Math.average = function(...array){
            if(array.length === 0){
                return 0;
            }
            return Math.sum(...array) / array.length;
        };

        Math.variance = function(...array){
            let avg = Math.average(...array);
            let list = [];
            for(let i = 0; i < array.length; i++){
                let u = array[i] - avg;
                list.push(u * u);
            }
            return Math.average(...list);
        };
    },

    promise: function(){
        Promise.delay = function(time){
            return new Promise((resolve, reject)=>{
                setTimeout(()=>{
                    return resolve();
                }, time);
            });
        };
    },
};
