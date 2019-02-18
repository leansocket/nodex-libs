
let colors = require("colors");

exports.init = function(scope) {

	let tostr = function(message){
		let otype = typeof(message);
        if(otype === 'undefined'){
            message = 'undefined';
        }
        else if (otype === "object") {
            message = JSON.stringify(message);
        }
        return message;
	};

	let tolog = function(message) {
	    let t = new Date();
	    let timestr = t.getFullYear() + "/" + (t.getMonth()+1) + "/" + t.getDate()
	        + " " + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();
		return scope + " " + timestr + " " + message;
	};

    let console_log = console.log;
	
	let log_list = {
		log : function(message){
			console_log(tolog(tostr(message).white));
		},

		notice: function (message) {
		    console_log(tolog(tostr(message).blue));
		},

		warn : function(message){
		    console_log(tolog(tostr(message).yellow));
		},

		error : function(message){
		    console_log(tolog(tostr(message).red.bold));
		},
	};
	
	for(let x in log_list){
		console[x] = log_list[x];
	}
};
