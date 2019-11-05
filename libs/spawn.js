let spawn = require('cross-spawn');
let events = require('events');

class SpawnedProcess extends events.EventEmitter {
    constructor({cwd, env} = {}) {
        super();

        this.cwd = cwd || process.cwd();
        this.env = env || process.env;
        
        this._taskQueue = [];
        this._processor = null;
    }

    async post(command, options, callback) {
        if(!command){
            return;
        }

        options = [];
        callback = undefined;

        if(arguments.length === 2) {
            if(typeof arguments[1] === 'function') {
                callback = arguments[1];
            }
            else if(typeof arguments[1] === 'string') {
                options = arguments[1].split(" ");
            }
            else if(Array.isArray(arguments[1])) {
                options = arguments[1];
            }
        }
        else if(arguments.length === 3) {
            if(Array.isArray(arguments[1])) {
                options = arguments[1];
            }
            else if (typeof arguments[1] === "string") {
                options = arguments[1].split(" ");
            }
            if(typeof arguments[2] === 'function') {
                callback = arguments[2];
            }
        }
    
        this._taskQueue.push({command, options, callback});
        
        this._run();
    
        return this;
    }

    _run() {
        if(!this._taskQueue.length || this._processor) {
            return;
        }
    
        let self = this;
        let task = self._taskQueue.shift();
    
        let stdout = [];
        let stderr = [];
    
        let complete = function(exitCode) {
            delete self._processor;
    
            let stdoutStr = stdout.length > 0 ? Buffer.concat(stdout).toString('utf-8') : '';
            let stderrStr = stderr.length > 0 ? Buffer.concat(stderr).toString('utf-8') : '';
            if(task.callback) {
                task.callback(exitCode, stdoutStr, stderrStr);
            }

            self.emit('out', exitCode, stdoutStr, stderrStr);
    
            process.nextTick(self._run.bind(self));
        }
    
        let spawned = spawn(task.command, task.options, {
            cwd: self.cwd,
            env: self.env
        });
        spawned.stdout.on('data', (data) => {
            stdout.push(data);
        });
        spawned.stderr.on('data', (data) => {
            stderr.push(data);
        });
        spawned.on('error', (err) => {
            stderr.push(Buffer.from(err.stack, 'ascii'));
         });
        spawned.on('close', (exitCode) => {
            complete(exitCode);
        });
    
        self._processor = spawned;
    }
};

exports.exec = function(command, options) {
    return spawn(command, options);
}

exports.execSync = function(command, options) {
    return spawn.sync(command, options);
}

exports.process = function({cwd, env} = {}) {
    return new SpawnedProcess({cwd, env});
}
