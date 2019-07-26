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

exports.query = function(sql, logsql = true) {
    return new Promise((resolve, reject)=>{
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

exports.transaction = function(autoRelease = true) {
    let Tx = function(conn, autoRelease){
        this.query = function(sql, logsql = true){
            return new Promise((resolve, reject)=>{
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

    return new Promise((resolve, reject)=>{
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
