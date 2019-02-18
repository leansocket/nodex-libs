
let fs = require("fs");
let path = require("path");

let VFS = function(root){
	// absolute path
	VFS.prototype.abs_path = function(path){
		return path.join(root, path);
	};
	
	// callback : function(base:string, ele:string, info:object)
	VFS.prototype.fetch = function(base, callback){
		let dir = path.join(root, base);
		fs.readdir(dir, function(error, list){
			if(!list){
				return;
			}		
			list.forEach(function(ele){
				let location = path.join(dir, ele);
				fs.stat(location, function(error, info){
					if(error){
						return;
					}	
					callback(base, ele, info);
				});
			});	
		});
	};

	// callback : function(base:string, dir:string)
	VFS.prototype.fetch_dirs = function(base, callback){
		VFS.prototype.fetch(base, function(base, ele, info){
			if(!info.isDirectory()) {
                return;
            }
            callback(base, ele);
			base = path.join(base, ele);
			VFS.prototype.fetch_dirs(base, callback);
		});
	};
	
	// callback : function(base:string, file:string)
	VFS.prototype.fetch_files = function(base, callback){
		VFS.prototype.fetch(base, function(base, ele, info){
			if(!info.isDirectory()) {
                callback(base, ele);
                return;
            }
            base = path.join(base, ele);
            VFS.prototype.fetch_files(base, callback);
		});
	};

    VFS.prototype.fetch_sync = function(base, callback){
        let dir = path.join(root, base);
        let list = fs.readdirSync(dir);
        if(!list){
            return;
        }

        list.forEach(function(ele){
            let location = path.join(dir, ele);
            let info = fs.statSync(location);
            callback(base, ele, info);
        });
    };

    // callback : function(base:string, dir:string)
    VFS.prototype.fetch_dirs_sync = function(base, callback){
        VFS.prototype.fetch_sync(base, function(base, ele, info){
            if(!info.isDirectory()) {
            	return;
            }
            callback(base, ele);
			base = path.join(base, ele);
			VFS.prototype.fetch_dirs_sync(base, callback);
        });
    };

    // callback : function(base:string, file:string)
    VFS.prototype.fetch_files_sync = function(base, callback){
        VFS.prototype.fetch_sync(base, function(base, ele, info){
            if(!info.isDirectory()) {
                callback(base, ele);
                return;
            }
            base = path.join(base, ele);
            VFS.prototype.fetch_files_sync(base, callback);
        });
    };
};

exports.create = function(root){
	return new VFS(root);
};
