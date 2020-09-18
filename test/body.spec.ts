import body from "../src/body";
import Koa from 'koa';
import request from 'supertest'

test("test body module feature.", async () => {

    // test getBodyPromise
    {
        const app = new Koa();
        const bodyParse = body({parsedMethods: []})
        app.use(bodyParse)
        app.use(function (ctx: any, next){
            expect(ctx.request.body).toEqual({})
        })
        const server = app.listen()
        request(server).get('/')
        server.close()
    }

    // json
    {
        const app = new Koa()
        const bodyParse = body({json: true, encoding: 'utf-8'})
        app.use(bodyParse)
        app.use(function (ctx: any, next) {
            expect(ctx.request.body).toEqual({a: 1})
            ctx.body = ctx.request.body
        })
        const server = app.listen()
        await request(server).post('/').set('content-type', 'application/json').send({a: 1}).expect({a: 1})
        server.close()
    }

    //urlencoded
    {
        const app = new Koa()
        const bodyParse = body({urlencoded: true})
        app.use(bodyParse)
        app.use(function (ctx: any, next) {
            expect(ctx.request.body).toEqual({a: '1'})
            ctx.body = ctx.request.body
        })
        const server = app.listen()
        await request(server).post('/').set('content-type', 'application/x-www-form-urlencoded').send('a=1').expect({a: '1'})
        server.close()
    }

    //text
    {
        const app = new Koa()
        const bodyParse = body({text: true})
        app.use(bodyParse)
        app.use(function (ctx: any, next) {
            expect(ctx.request.body).toBe('123')
            ctx.body = ctx.request.body
        })
        const server = app.listen()
        await request(server).post('/').set('content-type', 'text/plain').send('123').expect('123')
        server.close()
    }

    //multipart
    {
        const app = new Koa()
        const bodyParse = body({multipart: true})
        app.use(bodyParse)
        app.use(function (ctx: any, next) {
            expect(ctx.request.files[0].fieldname).toBe('file')
            expect(ctx.request.files[0].originalname).toBe('body.ts')
            expect(!!ctx.request.files[0].path).toBeTruthy()
            expect(!!ctx.request.files[0].size).toBeTruthy()
        })
        const server = app.listen()
        await request(server).post('/').set('content-type', 'multipart/form-data').attach('file', './src/body.ts', 'body.ts')
        server.close()
    }

    //default
    {
        const app = new Koa()
        const bodyParse = body({json: false, urlencoded: false, text: false, multipart: false})
        app.use(bodyParse)
        app.use(function (ctx: any, next) {
            expect(ctx.request.body).toBe('123')
            ctx.body = ctx.request.body
        })
        const server = app.listen()
        await request(server).post('/').set('content-type', 'text/plain').send('123').expect('123')
        server.close()
    }
});
