let mysql = require("mysql/promise");

export type MySqlOptions = {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    charset?: string;
};

export class Connection {
    private conn;

    constructor(conn: any) {
        this.conn = conn;
    }

    public async query(sql: string, logsql: boolean = true) : Promise<any> {
        if(logsql){
            console.log(`db: ${sql}`);
        }

        let ret = await new Promise((resolve, reject)=>{
            this.conn.query(sql, (err, ret) => {
                if (err) {
                    return reject(err);
                }
                return resolve(ret);
            });
        });

        return ret;
    }

    public async page(sql: string, page: number, size: number) : Promise<any> {   
        let has_limit = 
            sql.indexOf('limit') >= 0 ||
            sql.indexOf('LIMIT') >= 0;
    
        if (!has_limit) {
            if(page >= 0 && size > 0) {
                if(sql.endsWith(';')){
                    sql = sql.substr(0, sql.length - 1);
                }
                sql = `${sql} limit ${(page - 1) * size}, ${size};`;
            }
        }
    
        let calc_sql_found_rows =
            sql.indexOf('sql_calc_found_rows') > 0 ||
            sql.indexOf('SQL_CALC_FOUND_ROWS') > 0;
    
        if(!calc_sql_found_rows) {
            let results = await exports.query(sql);
            return {
                data: results || [],
                count: results.length || 0,
            };
        }
    
        await this.transaction();
        let rsList = await this.query(sql);
        let rsCount = await this.query(`select FOUND_ROWS() as 'count';`);
        await this.commit();
    
        return {
            data: rsList,
            count: rsCount.length > 0 ? rsCount[0].count : 0
        };
    };

    public async transaction() : Promise<void> {
        await new Promise((resolve, reject)=>{
            this.conn.beginTransaction((err)=>{
                if(err){
                    return reject(err);
                }
                resolve();
            });
        });
    }

    public async commit(): Promise<void> {
        await new Promise((resolve, reject)=>{
            this.conn.commit((err)=>{
                if(err){
                    return reject(err);
                }
                return resolve();
            });
        });
    }

    public async rollback() : Promise<void> {
        await new Promise((resolve, reject) => {
            this.conn.rollback((err)=>{
                if(err){
                    return reject(err);
                }
                return resolve();
            });
        });
    };

    public release() {
        this.conn.release();
        this.conn = null;
    }
}

export class MySql {
    private pool: any = null;

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

    public async connect(transaction: boolean = false) : Promise<Connection> {
        return await new Promise((resolve, reject)=>{
            this.pool.getConnection((err, conn) => {
                if (err) {
                    return reject(err);
                }
                if(!transaction) { 
                    return resolve(new Connection(conn));
                }
                conn.beginTransaction((err) => {
                    if(err) {
                        return reject(err);
                    }
                    return resolve(new Connection(conn));
                });
            });
        });
    }

    public async transaction() : Promise<Connection> {
        return await this.connect(true);
    }

    public async query(sql: string, logsql: boolean = true) : Promise<any> {
        let conn = await this.connect();
        let ret = await conn.query(sql, logsql);
        conn.release();
        return ret;
    }

    public async page(sql: string, page: number, size: number) : Promise<any> {
        let conn = await this.connect();
        let ret = await conn.page(sql, page, size);
        conn.release();
        return ret;
    }
}

const db = new MySql(); 
export default db;
