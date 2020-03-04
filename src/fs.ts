
const path = require('path');
const fs = require('fs-extra');

class VFS {
    private root: string;

    constructor(root: string) {
        this.root = root;
    }

    // absolute path
    public absolutePath(p: string): string {
        if (!p) {
            return this.root;
        }
        return path.join(this.root, p);
    }

    public fetch(base: string, callback: (base: string, ele: string, info: any) => void): void {
        let dir = path.join(this.root, base);
        fs.readdir(dir, (err, list) => {
            if (err || !list) {
                return;
            }
            list.forEach((ele) => {
                let location = path.join(dir, ele);
                fs.stat(location, (err, info) => {
                    if (err) {
                        return;
                    }
                    callback(base, ele, info);
                });
            });
        });
    };

    public fetchDirs(base: string, callback: (base: string, dir: string) => void): void {
        let self = this;
        self.fetch(base, (base, ele, info) => {
            if (!info.isDirectory()) {
                return;
            }
            callback(base, ele);
            base = path.join(base, ele);
            self.fetchDirs(base, callback);
        });
    };

    public fetchFiles(base: string, callback: (base: string, file: string) => void): void {
        let self = this;
        self.fetch(base, (base, ele, info) => {
            if (!info.isDirectory()) {
                callback(base, ele);
                return;
            }
            base = path.join(base, ele);
            self.fetchFiles(base, callback);
        });
    };

    public fetchSync(base: string, callback: (base: string, ele: string, info: any) => void): void {
        let dir = path.join(this.root, base);
        let list = fs.readdirSync(dir);
        if (!list) {
            return;
        }

        list.forEach(function (ele) {
            let location = path.join(dir, ele);
            let info = fs.statSync(location);
            callback(base, ele, info);
        });
    };

    // callback : function(base:string, dir:string)
    public fetchDirsSync(base, callback) {
        let self = this;
        self.fetchSync(base, function (base, ele, info) {
            if (!info.isDirectory()) {
                return;
            }
            callback(base, ele);
            base = path.join(base, ele);
            self.fetchDirsSync(base, callback);
        });
    };

    // callback : function(base:string, file:string)
    public fetchFilesSync(base, callback) {
        let self = this;
        self.fetchSync(base, function (base, ele, info) {
            if (!info.isDirectory()) {
                callback(base, ele);
                return;
            }
            base = path.join(base, ele);
            self.fetchFilesSync(base, callback);
        });
    };
}

const vfs = function (root: string): VFS {
    return new VFS(root);
};

export default {
    ...fs,
    vfs
};
