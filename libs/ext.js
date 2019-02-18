
module.exports = {
    error: function(){
        Error.make = function(code, message){
            let err = new Error(message);
            err.code = code;
            return err;
        };
    },

    math: function(){
        Math.random_range = function(min, max){
            return min + Math.random() * (max - min);
        };

        Math.random_range_int = function(min, max){
            return Math.floor(exports.random_range(min, max));
        };

        Math.clamp = function (x, a, b) {
            if(x < a) x = a;
            else if(x > b) x = b;
            return x;
        };

        Math.min_v = function(array){
            let min = array[0];
            for(let i = 0; i < array.length; i++){
                if(min > array[i]){
                    min = array[i];
                }
            }
            return min;
        };

        Math.max_v = function(array){
            let max = array[0];
            for(let i = 0; i < array.length; i++){
                if(max < array[i]){
                    max = array[i];
                }
            }
            return max;
        };

        Math.min_iv = function(array){
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

        Math.max_iv = function(array){
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

        Math.sum = function(array){
            let sum = 0;
            for(let i = 0; i < array.length; i++){
                sum += array[i];
            }
            return sum;
        };

        Math.average = function(array){
            if(array.length === 0){
                return 0;
            }
            return Math.sum(array) / array.length;
        };

        Math.variance = function(array){
            let avg = Math.average(array);
            let list = [];
            for(let i = 0; i < array.length; i++){
                let u = array[i] - avg;
                list.push(u * u);
            }
            return Math.average(list);
        };
    },

    string: function(){
        String.format = function(fmt, args){
            let str = fmt;
            for(let i = 0; i < args.length; i++){
                let re = new RegExp("\\{"+(i)+"\\}", "g");
                str = str.replace(re, args[i]);
            }
            return str;
        };

        String.prototype.format = function(){
            return String.format(this, arguments);
        };
    },

    array: function() {
        Array.prototype.indexOf = function (val) {
            for (let i = 0; i < this.length; i++) {
                if (this[i] === val) return i;
            }
            return -1;
        };

        Array.prototype.remove = function (val) {
            let index = this.indexOf(val);
            if (index > -1) {
                this.splice(index, 1);
            }
        };

        Array.prototype.removeAll = function(predicate){
            let list = [];
            this.forEach((e)=>{
                if(predicate(e)){
                    list.push(e);
                }
            });
            list.forEach((e)=>{
                this.remove(e);
            });
            return list;
        };

        Array.prototype.equals = function (array) {
            // if the other array is a falsy value, return
            if (!array)
                return false;
            // compare lengths - can save a lot of time
            if (this.length !== array.length)
                return false;
            for (let i = 0, l = this.length; i < l; i++) {
                // Check if we have nested arrays
                if (this[i] instanceof Array && array[i] instanceof Array) {
                    // recurse into the nested arrays
                    if (!this[i].equals(array[i]))
                        return false;
                }
                else if (this[i] !== array[i]) {
                    // Warning - two different object instances will never be equal: {x:20} != {x:20}
                    return false;
                }
            }
            return true;
        };

        Array.prototype.contains = function (value) {
            for (let i in this) {
                if (this[i] instanceof Array && value instanceof Array) {
                    if (this[i].equals(value)) {
                        return true;
                    }
                } else {
                    if (this[i] === value) {
                        return true;
                    }
                }
            }
            return false;
        };
    },

    promise: function(){
        Promise.toArray = function(promise){
            return promise
                .then(data=>[null, data])
                .catch(err=>[err]);
        };

        Promise.delay = function(time){
            return new Promise((resolve, reject)=>{
                setTimeout(()=>{
                    return resolve();
                }, time)
            });
        };
    },

    functions: function(){
        Function.combine = function(func0, func1){
            return function(){
                func0.call(arguments);
                func1.call(arguments);
            };
        };
    },
};
