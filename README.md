# nodex-libss

nodex-libs是一个基于nodejs的服务端程序库。其中包含在实际工程中可用的方法。可以简化nodejs程序开发。

## 特性

* 所有API和接口都有完整的文档和类型标注。
* 所有模块都使用最新的es6或es7的标准实现，所有异步任务都采用async/await的方式实现。
* 提供基于标签和着色的原生日志方法。
* 支持简洁的HTTP和HTTPS请求发起。
* 支持基于Koa2的简化的HTTP/HTTPS服务器接口，提供干净简洁的错误处理工作流，支持完全可控的文件上传下载功能。
* 提供了简洁的基于mysql连接池的数据库操作，支持mysql事务处理。
* 提供常用的加hash算法、加密解密算法的接口。
* 提供对基于Token、验证码、验证键的用户身份识别方法。
* 提供简洁的数据格式/表单校验方法。
* 提供基于flake的唯一编码生成方法。
* 提供时间段、时间点等对日期时间的处理方法。

## 安装

```shell
npm install nodex-libs --save
```
## 使用样例

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

Spawn
```js
const libs = require('nodex-libs');
const spawn = libs.spawn;

let p = spawn.process();
p.on('out', (code, out, err) => {
    console.log(`${code} ${out} ${err}`);
});

for(let i = 0; i < 10; i++) {
    p.post(`echo`, [`command`, `${i}`]);
}
p.post(`npm`, [`--version`]);
```

## Release Note

### 1.7.2
* NEW: http.request.

### 1.7.0
* MOD: Error.make(name, message), set error.name.
* MOD: util.makeXdata always returns data field.
* MOD: http.send always return data field.
* ENH: console.log/info/notice/warn/error support multiple arguments.

### 1.6.8
* MOD: http.handle -> http.handler.
* NEW: added a new module 'mysql' and 'db' is deprecated now.

### 1.6.0
* NEW: added a new module 'spawn'. 
    + it can be used to execute chile-process commands.
    + it depends on cross-spawn and implements an asynchorous command queue.  

### 1.5.13
* NEW: added a new api: http.sendFile to send a server-end file to client.

### 1.5.7
* NEW: body module provide a new config options : options.multer.ignoreFiles.
* NEW: added a new api: time.point to create a new TimePoint by timestamp.

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
