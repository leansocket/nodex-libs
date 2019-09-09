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

Date and Time Operations:
```js
const libs = require('nodex-libs');
const time = libs.time;

// now
let now = new time.TimePoint();
now = time.now();
console.log(now.toString('year-month-date hour:minute:second'));

let yesterday = new time.TimePoint(now.value() - time.MS_PER_DAY);
console.log(yesterday.toString());

let span = now.sub(yesterday);
console.log(`begin=${span.begin()}, end=${span.end()}`);

let thisWeek = now.thisWeek();
console.log(`begin=${thisWeek.begin()}, end=${thisWeek.end()}`);

let duration = new time.Duration(time.MS_PER_DAY);
console.log(`minutes: ${duration.accurateMinutes()}`)
```

## Release Note

### 1.5.6
* NEW: added 'charset' property to db.config.
* NEW: added support outputing 'log-level' for console.log/info/notice/warn/error.

### 1.5.0
* MOD: deprecated 'formidable', use 'multer' to parse multipart body data.

### 1.4.0
* NEW: added a new module time which provides apis for TimePoint & TimeSpan.
* DEL: removed extension apis of String, Array, Function.

### 1.3.1
* NEW: supported http2.

### 1.3.0
* NEW: added a new api: http.call and replaced http.rpc with this api.
* MOD: modified the api http.rpc to make a http-rpc object.

### 1.2.28
* NEW: added a new api: util.computeGeoDistance to compute the distance of two points on the Earth.
* NEW: added a new api: html.escape to escape the special characters in html-string.

### 1.2.27
* NEW: added a new api: http.rpc to request remote services.

### 1.2.26
* FIX: fixed a bug of http.handle.

### 1.2.25
* ENH: db.transaction.commit&rollback were async function.

### 1.2.24
* MOD: modified the name of http errors.
* NEW: added a new api: http.handle to make a kind of common used middlewares of koa.

### 1.2.23
* NEW: added a new api: db.page.

### 1.2.16
* MOD: changed name of 'schedule' to camel case.

### 1.2.15
* MOD: replaced the dependency 'colors' with 'chalk'.
* MOD: used 'chalk' to implement the module 'log'.

### 1.2.14
* ENH: updated some regular rules for fmt.
* ENH: fmt.optional supported defaultValue.

### 1.2.13
* ENH: handled errors of multi-part-file.
* NEW: added a new api: http.body to make a custom body-parser.

### 1.2.11
* MOD: modified the fmt.check to fmt.required and fmt.optional.

### 1.2.10
* FIX: fixed a bug of body-parser.

### 1.2.9
* Updated the version of dependencies.
* Removed body options.strict.
* Added options.parsedMethods which is an array of HTTP methods will be parsed by body.
* body options.formidable supported function-type which returns a options object for formidable.

### 1.2.6
* Fixed: http.post options.headers covered the inner HTTP headers.

### 1.2.5
* fmt.check: minlen & maxlen supported field.length and field.length();
* http.webapp(args): added a new boolean field args.proxy for x-forwarded-for;

## License

MIT license
