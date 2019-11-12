let mysql = require("mysql");

let pool = null;

exports.init = function(args) {
    args = args || {};
    pool = mysql.createPool({
        host: args.host || '127.0.0.1',
        port: args.port || 3306,
        user: args.user || 'root',
        password: args.pswd || '',
        database: args.db || 'mysql',
        charset: args.charset || undefined
    });
};

exports.transaction = async function(autoRelease = true) {
    let Tx = function(conn, autoRelease){
        this.query = async function(sql, logsql = true){
            return await new Promise((resolve, reject)=>{
                if(logsql){
                    console.log(`db: ${sql}`);
                }
                conn.query(sql, (err, results, fields) => {
                    if (err) {
                        console.log(`db: ${err.message}`);
                        return reject(err);
                    }
                    return resolve(results, fields);
                });
            });
        };

        this.commit = async function(){
            return await new Promise(function(resolve, reject){
                conn.commit((err)=>{
                    if(err){
                        console.log(`db: ${err.message}`);
                        return reject(err);
                    }
                    if(autoRelease){
                        conn.release();
                    }
                    return resolve(autoRelease);
                });
            });
        };

        this.rollback = async function(){
            return await new Promise(function(resolve, reject){
                conn.rollback((err)=>{
                    if(err){
                        console.log(`db: ${err.message}`);
                        return reject(err);
                    }
                    if(autoRelease){
                        conn.release();
                    }
                    return resolve(autoRelease);
                });
            });
        };

        this.release = function(){
            conn.release();
        };
    };

    return await new Promise((resolve, reject)=>{
        pool.getConnection(function (error, conn) {
            if (error) {
                console.log(`db: ${error.message}`);
                return reject(error);
            }
            conn.beginTransaction((error)=>{
                if(error){
                    console.log(`db: ${error.message}`);
                    return reject(error);
                }
                return resolve(new Tx(conn, autoRelease));
            });
        });
    });
};

exports.query = async function(sql, logsql = true) {
    return await new Promise((resolve, reject)=>{
        if(logsql){
            console.log(`db: ${sql}`);
        }

        pool.getConnection((error, conn) => {
            if (error) {
                console.log(`db: ${error.message}`);
                return reject(error);
            }

            conn.query(sql, (error, results, fields) => {
                conn.release();
                if (error) {
                    console.log(`db: ${error.message}`);
                    return reject(error);
                }

                return resolve(results, fields);
            });
        });
    });
};

exports.page = async function(sql, page, size) {
    if (!sql || typeof(sql) !== 'string'){
        throw Error.make('ERR_SQL_SYNTAX', 'the sql syntax is error.');
    }

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

    let tx = await exports.transaction();
    let rsList = await tx.query(sql);
    let rsCount = await tx.query(`select FOUND_ROWS() as 'count';`);
    await tx.commit();

    return {
        data: rsList,
        count: rsCount.length > 0 ? rsCount[0].count : 0
    };
};
