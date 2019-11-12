let libs = require('../index');

// scoped & colored logs
{
    libs.log.init('nodex-libs-test');
    console.log('multiple arguments', 1, 2, true, {result: 'ok'});
    console.log('this is console.log');
    console.info('this is console.info');
    console.notice('this is console.notice');
    console.warn('this is console.warn');
    console.error('this is console.error');
}

// auth-code, auth-token, auth-key
{
    let code = new libs.authes.Code(6, 600);
    let a_code = code.make('email', 'abc@abc.com');
    let a_match = code.check('email', 'abc@abc.com');
    console.log(`a_code = ${a_code}, match = ${JSON.stringify(a_match)}`);

    let token = new libs.authes.Token('345342', 600);
    let b_token = token.make(10032);
    let b_match = token.check(b_token);
    console.log(`b_token=${b_token}, b_match=${JSON.stringify(b_match)}`);


    let key = new libs.authes.Key(8, 600);
    let c_key = key.make(10032);
    let c_match = key.check(c_key);
    console.log(`c_key=${c_key}, c_match=${JSON.stringify(c_match)}`);
}

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
