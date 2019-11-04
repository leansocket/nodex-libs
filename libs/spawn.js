let spawn = require('cross-spawn');
let events = require('events');

class SpawnedProcess extends events.EventEmitter {
    constructor(cwd, env) {
        super();

        this.cwd = cwd || process.cwd();
        this.env = env || process.env;
        
        this._taskQueue = [];
        this._processor = null;
    }

    post(command, options) {
        if (typeof options === "string") {
            options = options.split(" ");
        }
    
        this._taskQueue.push({command, options});
        
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
