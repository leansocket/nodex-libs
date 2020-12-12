
import crossSpawn from 'cross-spawn';

/**
 * 子进程选项
*/
export interface SpawnOptions {
    /**
     * 子进程工作目录，默认为当前进程的工作目录。
    */
    cwd?: string;
    /**
     * 子进程环境变量，默认为当前进程的环境变量。
    */
    env?: any;
}

/**
 * 子进程执行结果
 */
export interface SpawnResult {
    /**
     * 退出值，一般无错误发生就为0，具体需子进程确定。
     */
    exitcode: number;
    /**
     * 标准输出
     */
    stdout: string;
    /**
     * 标准错误
     */
    stderr: string;
}

/**
 * 执行一条命令
*/
export async function exec(command: string, args: string[], options?: SpawnOptions): Promise<SpawnResult> {
    options = options || {};

    return new Promise((resolve, reject) => {
        const stdout = [];
        const stderr = [];

        const spawned = crossSpawn(command, args, {
            cwd: options.cwd || process.cwd(),
            env: options.env || process.env,
        });
        spawned.stdout.on('data', (data) => {
            stdout.push(data);
        });
        spawned.stderr.on('data', (data) => {
            stderr.push(data);
        });
        spawned.on('error', (err) => {
            reject(err);
        });
        spawned.on('close', (exitcode) => {
            const stdoutStr = stdout.length > 0 ? Buffer.concat(stdout).toString('utf-8') : '';
            const stderrStr = stderr.length > 0 ? Buffer.concat(stderr).toString('utf-8') : '';
            resolve({
                stdout: stdoutStr,
                stderr: stderrStr,
                exitcode: exitcode,
            });
        });
    });
}

/**
 * 同步执行一调命令
*/
export function execSync(command, args) {
    return crossSpawn.sync(command, args);
}

