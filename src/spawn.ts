
import { EventEmitter } from 'events';
import spawn from 'cross-spawn';

/**
 * 子进程选项
*/
export type  SpawnedProcessOptions = {
    /**
     * 子进程工作目录，默认为当前进程的工作目录。
    */
    cwd: string;
    /**
     * 子进程环境变量，默认为当前进程的环境变量。
    */
    env: any;
}

export type SpawnedProcessCallback = (exitCode:string, stdoutStr: string, stderrStr: string)=>void;

/**
 * 带命令缓冲队列的跨平台子进程。
 * * 将命令post到子进程，内部会自动启动进程执行，执行完毕通过回调函数通知任务执行方。
 * * post只是将一个任务加入缓冲队列就会返回，并不会等待任务结束。
*/
export class SpawnedProcess extends EventEmitter {
    public cwd: string;
    public env: any;

    private _taskQueue = [];
    private _processor = null;

    constructor(options: SpawnedProcessOptions) {
        super();

        this.cwd = options.cwd || process.cwd();
        this.env = options.env || process.env;
    }

    /**
     * 执行一条命令。
     * * post只是将命令及其参数放入缓冲队列，并不会等待任务执行结束。
     * * 任务执行结束后，会通过回调通知调用方。
     * @param {string} command 任务命令
     * @param {string[]} options 任务选项参数
     * @param {SpawnedProcessCallback} callback 任务完成回调函数
     * @returns {SpawnedProcess} 子进程本身，方便链式调用。
    */
    public post(command:string, options:string[], callback:SpawnedProcessCallback) : SpawnedProcess {
        if(!command){
            return;
        }

        options = options || []
        options = options.filter(o => !!o);

        this._taskQueue.push({command, options, callback});
        
        this._run();
    
        return this;
    }

    private _run() {
        if(!this._taskQueue.length || this._processor) {
            return;
        }
    
        let task = this._taskQueue.shift();
    
        let stdout = [];
        let stderr = [];
    
        let complete = (exitCode) => {
            delete this._processor;
    
            let stdoutStr = stdout.length > 0 ? Buffer.concat(stdout).toString('utf-8') : '';
            let stderrStr = stderr.length > 0 ? Buffer.concat(stderr).toString('utf-8') : '';
            if(task.callback) {
                task.callback(exitCode, stdoutStr, stderrStr);
            }

            this.emit('out', exitCode, stdoutStr, stderrStr);
    
            process.nextTick(this._run.bind(this));
        }
    
        let spawned = spawn(task.command, task.options, {
            cwd: this.cwd,
            env: this.env
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
    
        this._processor = spawned;
    }
};

/**
 * 执行一条命令
*/
export const exec = function(command, options) {
    return spawn(command, options);
}

/**
 * 同步执行一调命令
*/
export const execSync = function(command, options) {
    return spawn.sync(command, options);
}

/**
 * 启动一个带任务缓冲的子进程。
 * @param {SpawnedProcessOptions} options 子进程选项
 * @returns {SpawnedProcess} 子进程对象
 */
export const spawnProcess = function(options: SpawnedProcessOptions) {
    return new SpawnedProcess(options);
}
