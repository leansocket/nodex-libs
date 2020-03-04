
const path = require('path');
const fs = require('fs-extra');

class VFS {
    constructor(root) {
        this.root = root;
    }

    // absolute path
    absolutePath(p) {
        if(!p){
            return this.root;
        }
        return path.join(this.root, p);
    }

    // callback : function(base:string, ele:string, info:object)
    fetch(base, callback) {
		let dir = path.join(root, base);
		fs.readdir(dir, (err, list) => {
			if(!list) {
				return;
			}		
			list.forEach((ele) => {
				let location = path.join(dir, ele);
				fs.stat(location, (err, info) => {
					if(err){
						return;
					}	
					callback(base, ele, info);
				});
			});	
		});
    };
    
    // callback : function(base:string, dir:string)
	fetchDirs(base, callback) {
        let self = this;
		self.fetch(base, (base, ele, info) => {
			if(!info.isDirectory()) {
                return;
            }
            callback(base, ele);
			base = path.join(base, ele);
			self.fetchDirs(base, callback);
		});
    };
    
    // callback : function(base:string, file:string)
	fetchFiles(base, callback) {
        let self = this;
		self.fetch(base, (base, ele, info) => {
			if(!info.isDirectory()) {
                callback(base, ele);
                return;
            }
            base = path.join(base, ele);
            self.fetchFiles(base, callback);
		});
    };
    
    fetchSync(base, callback) {
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
    fetchDirsSync = function(base, callback){
        let self = this;
        self.fetchSync(base, function(base, ele, info){
            if(!info.isDirectory()) {
            	return;
            }
            callback(base, ele);
			base = path.join(base, ele);
			self.fetchDirsSync(base, callback);
        });
    };

    // callback : function(base:string, file:string)
    fetchFilesSync = function(base, callback){
        let self = this;
        self.fetchSync(base, function(base, ele, info){
            if(!info.isDirectory()) {
                callback(base, ele);
                return;
            }
            base = path.join(base, ele);
            self.fetchFilesSync(base, callback);
        });
    };
}

const vfs = function(root: string) : VFS {
	return new VFS(root);
};

export default {
    ...fs,
    vfs
};
