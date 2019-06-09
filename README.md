# Nodex-libs

This project forked from node-xapp^2.7.1. it is a node.js library which contains a patch of convenient functioninalities.

## Features

* All apis are based on es6 standard promise, work confortably with async/awit.
* Scoped & colored logger apis.
* Simplified httpserver apis based on koa2, good supports for https, compact and clear exception processing workflow.
* Simplified http get, post request apis.
* Simplified mysql db-api, good support for transactions.
* Common used user auth functions.

## Install

```shell
npm install nodex-libs --save
```

## Usage

import

```js
const libs = require('nodex-libs');
```

logger apis

```js
const libs = require('nodex-libs');

libs.log.init('scope-name');

console.log(`log message`);
console.info(`info message`);
console.warn(`warning message`);
console.error(`error message`);
```

http server

```js
const libs = require('nodex-libs');
const http = libs.http;

const args = {
    body: {},
    host: '127.0.0.1',
    port: 80,
    corn: true,
    log: true
};

let hello = (ctx) => {
    http.send(ctx, 'hello world.');
};

let about = (ctx) => {
    let ret = {
        name: 'nodex-libs test',
        info: 0
    };
    
    http.send(ctx, info);
};

let app = libs.http.webapp(args);

app.route((r)=>{
    r.get('/hello', hello);
    r.get('/about', about);
});

app.start();

```

mysql db

```js
const libs = require('nodex-libs');
const db = libs.db;

db.init({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    pswd: 'root'
});

{
    let sql = 'select * from test';
    let list = await db.query(sql);
    console.log(JSON.stringify(list));
}

{
    let sql = 'delete from test where id = 0';
    let ret = await db.query(sql);
    console.log(ret.affectedRows);
}

// transaction
do
{
    let tx = db.transaction();
    
    let ret = await tx.query('update test set status = 0 where id = 10';
    if(ret.affectedRows !== 1){
        tx.rollback();
        tx.release();
        break;
    }
    
    ret = await tx.query('update test data = 1 where id = 10');
    if(ret.affectedRows !== 1){
         tx.rollback();
         tx.release();
         break;
    }
    
    tx.commit();
    tx.release();
}
while(0);
```

flakes unique ID:

```js
const libs = require('nodex-libs');
const flakes = libs.flakes;

let f = flakes.create();
for(let i = 0; i < 10; i++){
    console.log(f.get());
}
```

## Release Note

### 1.2.8
* Updated the version of dependencies.
* Changed the type of body options.formidable.onFileBegin to (ctx, name, file) => void;
* Removed body options.strict.
* Added options.parsedMethods which is an array of HTTP methods will be parsed by body.

### 1.2.5
* fmt.check: minlen & maxlen support field.length and field.length();
* http.webapp(args): add a new boolean field args.proxy for x-forwarded-for;

## License

MIT license
