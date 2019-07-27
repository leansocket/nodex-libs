let mysql = require("mysql");

let pool = null;

exports.init = function(config) {
    pool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.pswd,
        database: config.db
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

        this.rollback = function(){
            conn.rollback((err)=>{
                if(err){
                    console.log(`db: ${err.message}`);
                }
                if(autoRelease){
                    conn.release();
                }
            });
        };

        this.commit = function(){
            conn.commit((err)=>{
                if(err){
                    console.log(`db: ${err.message}`);
                }
                if(autoRelease){
                    conn.release();
                }
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

    if (sql.indexOf('limit') === -1 &&
        sql.indexOf('LIMIT') === -1) {
        if(page >= 0 && size > 0) {
            if(sql.endsWith(';')){
                sql = sql.substr(0, sql.length - 1);
            }
            sql = sql + ` limit ${(page - 1) * size}, ${size};`;
        }
    }

    let calc_sql_found_rows =
        sql.indexOf('sql_calc_found_rows') > 0 ||
        sql.indexOf('SQL_CALC_FOUND_ROWS') > 0;

    if(!calc_sql_found_rows) {
        let results = await exports.query(sql);
        return {
            list: results,
            count: list.length,
        };
    }

    let tx = await exports.transaction();
    let rsList = await tx.query(sql);
    let rsCount = await tx.query(`select FOUND_ROWS() as count;`);
    tx.release();

    return {
        list: rsList,
        count: rsCount.length > 0 ? rsCount[0].count : 0
    };
};
