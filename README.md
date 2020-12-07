# nodex-libs

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
const mysql = libs.mysql;

mysql.init({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    pswd: 'root'
});

{
    let sql = 'select * from test';
    let list = await mysql.query(sql);
    console.log(JSON.stringify(list));
}

{
    let sql = 'delete from test where id = 0';
    let ret = await mysql.query(sql);
    console.log(ret.affectedRows);
}

// transaction
do
{
    let tx = mysql.transaction();
    
    let ret = await tx.query('update test set status = 0 where id = 10');
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

MongoDB

```js
const libs = require('nodex-libs');
const mongodb = libs.mongodb;

const mongoInstance = mongodb.init({
    uri: 'mongodb://127.0.0.1：27017',
    database: 'test',
    options: {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
})

const result = await mongoInstance.query(db => db.collection('user').find().toArray());
console.log(result);
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

## License

MIT license
