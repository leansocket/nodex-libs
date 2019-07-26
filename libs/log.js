
let chalk = require("chalk");

exports.init = function(scope) {

	let tostr = function(message) {
        if(message === undefined){
        	return 'undefined';
		}
		if(message === null){
        	return 'null';
		}
		let type = typeof(message);
		if(type === 'object'){
			return JSON.stringify(message);
		}
        return message;
	};

	let tolog = function(message) {
	    let t = new Date();
	    let Y = t.getFullYear();
	    let M = t.getMonth();
	    let D = t.getDate();
	    let h = t.getHours();
	    let m = t.getMinutes();
	    let s = t.getSeconds();
	    let timestr = `${Y}/${M}/${D} ${h}:${m}:${s}`;
	    let logstr = `${timestr} [${scope}] ${message}`;
	    return logstr;
	};

	let themes = {
		log: chalk.white,
		info: chalk.green,
		notice: chalk.blue,
		warn: chalk.yellow.bold,
		error: chalk.red.bold,
	};

    let console_log = console.log;

	for(let x in themes){
		console[x] = function(message){
            let str = tolog(tostr(message));
            console_log(themes[x](str));
		};
	}
};
