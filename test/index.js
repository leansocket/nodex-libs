let libs = require('../index');

// scoped & colored logs
libs.log.init('nodex-libs-test');
console.log('this is console.log');
console.info('this is console.info');
console.warn('this is console.warn');
console.error('this is console.error');

// web server
{
    let http = libs.http;
    let app = http.webapp({
        name: 'test-http',
        port: 8080,
        host: '0.0.0.0',
        cors: true,
        log: true
    });
    app.route((r)=>{
        r.get('/', (ctx)=>{
            ctx.body = 'hello world.';
        });
    });

    app.start();
}
