# Nodex-libs

This project forked from node-xapp^2.7.1. it is a node.js library which contains a patch of convenient functioninalities.

## Features

* All apis are based on es6 standard promise, work confortably with async/awit.
* Scoped & colored logger apis.
* Simplified httpserver apis based on koa2, good supports for https.
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
libs.log.init('scope-name');
console.log(`log message`);
console.info(`info message`);
console.warn(`warning message`);
console.error(`error message`);
```

http server

```js

```

mysql db

```js
```



## License

MIT license
