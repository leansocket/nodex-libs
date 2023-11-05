import mysql from "mysql";

/**
 * mysql选项
*/
export type MySqlOptions = {
    /**
     * mysql主机，IP或域名。
    */
    host: string;
    /**
     * 端口号，默认3306.
    */
    port: number;
    /**
     * 数据库服务的用户名
    */
    user: string;
    /**
     * 数据库服务的用户密码
    */
    password: string;
    /**
     * 选择的数据库名称
    */
    database: string;
    /**
     * 字符集
    */
    charset?: string;
};

/**
 * 数据库链接对象
 */
export class Connection {
    private conn;

    constructor(conn: any) {
        this.conn = conn;
    }

    /**
     * 执行一次sql查询
     * @param {string} sql SQL语句
     * @param {boolean} logsql 是否打印SQL语句
     * @returns {any} 查询结果集
    */
    public async query(sql: string, logsql: boolean = true): Promise<any> {
        if (logsql) {
            console.log(`db: ${sql}`);
        }

        let ret = await new Promise((resolve, reject) => {
            this.conn.query(sql, (err, ret) => {
                if (err) {
                    return reject(err);
                }
                return resolve(ret);
            });
        });

        return ret;
    }

    /**
     * 执行一次分页查询
     * @param {string} sql SQL语句
     * @param {number} page 当前页码，从1开始。
     * @param {number} size 每页的数据条数
     * @returns {any} 查询结果集
    */
    public async page(sql: string, page: number, size: number): Promise<any> {
        let has_limit =
            sql.indexOf('limit') >= 0 ||
            sql.indexOf('LIMIT') >= 0;

        if (!has_limit) {
            if (page >= 0 && size > 0) {
                if (sql.endsWith(';')) {
                    sql = sql.substr(0, sql.length - 1);
                }
                sql = `${sql} limit ${(page - 1) * size}, ${size};`;
            }
        }

        let calc_sql_found_rows =
            sql.indexOf('sql_calc_found_rows') > 0 ||
            sql.indexOf('SQL_CALC_FOUND_ROWS') > 0;

        if (!calc_sql_found_rows) {
            let results = await this.query(sql);
            return {
                list: results || [],
                count: results.length || 0,
            };
        }

        await this.transaction();
        let rsList = await this.query(sql);
        let rsCount = await this.query(`select FOUND_ROWS() as 'count';`);
        await this.commit();

        return {
            list: rsList,
            count: rsCount.length > 0 ? rsCount[0].count : 0
        };
    };

    /**
     * 开启事务
    */
    public async transaction(): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            this.conn.beginTransaction((err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    /**
     * 提交事务
    */
    public async commit(): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            this.conn.commit((err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }

    /**
     * 回滚事务
    */
    public async rollback(): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            this.conn.rollback((err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    };

    /**
     * 释放连接
    */
    public release() {
        this.conn.release();
        this.conn = null;
    }
}

/**
 * mysql数据库访问对象
*/
export class MySql {
    private pool: any = null;

    /**
     * 构造器
    */
    public async init(options: MySqlOptions) {
        (options as any) = options || {};

        this.pool = mysql.createPool({
            host: options.host || '127.0.0.1',
            port: options.port || 3306,
            user: options.user || 'root',
            password: options.password || '',
            database: options.database,
            charset: options.charset
        });
    }

    /**
     * 连接数据库
     * @param {boolean} transaction 开启事务
     * @returns {Connection} 数据库连接对象
    */
    public async connect(transaction: boolean = false): Promise<Connection> {
        return await new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                if (err) {
                    return reject(err);
                }
                if (!transaction) {
                    return resolve(new Connection(conn));
                }
                conn.beginTransaction((err) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(new Connection(conn));
                });
            });
        });
    }

    /**
     * 连接数据库并开启事务。
    */
    public async transaction(): Promise<Connection> {
        return await this.connect(true);
    }

    /**
     * 连接数据库，执行一次SQL查询，并自动释放连接。
     * @param {string} sql SQL语句
     * @param {boolean} logsql 是否打印SQL语句
     * @returns {any} 查询结果集
    */
    public async query(sql: string, logsql: boolean = true): Promise<any> {
        let conn = await this.connect();
        let ret = await conn.query(sql, logsql);
        conn.release();
        return ret;
    }

    /**
     * 连接数据库，执行一次分页查询，并自动释放连接。
     * @param {string} sql SQL语句
     * @param {number} page 当前页码，从1开始。
     * @param {number} size 每页的数据条数
     * @returns {any} 查询结果集
    */
    public async page(sql: string, page: number, size: number): Promise<any> {
        let conn = await this.connect();
        let ret = await conn.page(sql, page, size);
        conn.release();
        return ret;
    }
}

const db = new MySql();

/**
 * 初始化全局MySql对象
*/
export const init = async function (options: MySqlOptions) {
    return await db.init(options);
}

/**
  * 连接数据库
  * @param {boolean} transaction 开启事务
  * @returns {Connection} 数据库连接对象
 */
export const connect = async function (transaction: boolean = false): Promise<Connection> {
    return await db.connect(transaction);
}

/**
 * 连接数据库并开启事务。
*/
export const transaction = async function (): Promise<Connection> {
    return await db.connect(true);
}

/**
 * 连接数据库，执行一次SQL查询，并自动释放连接。
 * @param {string} sql SQL语句
 * @param {boolean} logsql 是否打印SQL语句
 * @returns {any} 查询结果集
*/
export const query = async function (sql: string, logsql: boolean = true): Promise<any> {
    return await db.query(sql, logsql);
}

/**
 * 连接数据库，执行一次分页查询，并自动释放连接。
 * @param {string} sql SQL语句
 * @param {number} page 当前页码，从1开始。
 * @param {number} size 每页的数据条数
 * @returns {any} 查询结果集
*/
export const page = async function (sql: string, page: number, size: number): Promise<any> {
    return await db.page(sql, page, size);
}
