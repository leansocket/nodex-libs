import { isHttps, combineUrlAndParams, getRequestOptions, request, get, post, call, rpc } from "../src/http";
import Koa from 'koa';
import body from "../src/body";
import { delay } from "../src/util";

const bodyParse = body({})

test('Test isHttps function', () => {
    expect(isHttps('http://www.leansocket.com')).toBeFalsy()
    expect(isHttps('https://www.leansocket.com')).toBeTruthy()
})

test('Test combineUrlAndParams function', () => {
    expect(combineUrlAndParams('https://www.leansocket.com', {
        a:1,
        b:2,
        c:3
    })).toBe('https://www.leansocket.com?a=1&b=2&c=3')
})

test('Test getRequestOptions function', () => {
    expect(getRequestOptions(null)).toBe(null)
    expect(getRequestOptions('')).toBe(null)
    expect(getRequestOptions('https://www.leansocket.com:80')).toEqual({
        hostname: 'www.leansocket.com',
        port: '80',
        path: '/',
        safe: true
    })
})

test('Test request function', async () => {
    // GET
    {
        const app = new Koa();
        const server = app.listen()
        const address: any = server.address()
        const host = address.host
        const port = address.port
        app.use(function (ctx){
            expect(ctx.originalUrl).toBe('/?a=1&b=2')
        })
        await request({
            method: 'GET',
            hostname: host,
            port: port,
            path: '/',
        },{
            a: 1,
            b: 2
        })
        server.close()
    }

    // POST
    {
        const app = new Koa();
        const server = app.listen()
        const address: any = server.address()
        const host = address.host
        const port = address.port
        app.use(bodyParse)
        app.use(function (ctx){
            expect(ctx.originalUrl).toBe('/')
            expect((ctx.request as any).body).toEqual({
                a: 1,
                b: 2
            })
        })
        await request({
            method: 'POST',
            hostname: host,
            port: port,
            path: '/',
        },{
            a: 1,
            b: 2
        })
        server.close()
    }
})

test('Test request timeout', async () => {
    const app = new Koa();
    const server = app.listen()
    const address: any = server.address()
    const host = address.host
    const port = address.port
    app.use(async function (ctx){
        await delay(2);
        ctx.body = 'ok'
    })
    const res = await request({
        method: 'GET',
        hostname: host,
        port: port,
        path: '/',
        timeout: 1000
    },{})
    expect(res.status).toBe(408)
    server.close()
})

test('Test get function', async () => {

    const app = new Koa();
    const server = app.listen()
    const address: any = server.address()
    const host = address.host
    const port = address.port
    app.use(function (ctx){
        expect(ctx.originalUrl).toBe('/?a=1&b=2')
    })
    await get({
        method: 'GET',
        hostname: host,
        port: port,
        path: '/',
    },{
        a: 1,
        b: 2
    })
    server.close()

})

test('Test post function', async () => {

    const app = new Koa();
    const server = app.listen()
    const address: any = server.address()
    const host = address.host
    const port = address.port
    app.use(bodyParse)
    app.use(function (ctx){
        expect(ctx.originalUrl).toBe('/')
        expect((ctx.request as any).body).toEqual({
            a: 1,
            b: 2
        })
    })
    await post({
        method: 'POST',
        hostname: host,
        port: port,
        path: '/',
    },{
        a: 1,
        b: 2
    })

    server.close()

})

test('Test call function', async () => {
    const app = new Koa();
    const server = app.listen()
    const address: any = server.address()
    const host = address.host
    const port = address.port
    app.use(bodyParse)
    app.use(function (ctx){
        expect(ctx.originalUrl).toBe('/')
        expect((ctx.request as any).body).toEqual({
            a: 1,
            b: 2
        })

        ctx.body = {
            result: 'ok',
            data: (ctx.request as any).body
        }
    })
    const res = await call({
        method: 'POST',
        hostname: host,
        port: port,
        path: '/',
    },{
        a: 1,
        b: 2
    })
    expect(res).toEqual({
        a: 1,
        b: 2
    })
    server.close()
})

test('Test rpc generator function', () => {
    const apis = {
        auth: ['login_by_phone', 'login_by_code', 'login_by_auth']
    }
    const services: any = rpc('https://www.leansocket.com', apis)
    expect('loginByPhone' in services).toBeTruthy()
    expect('loginByCode' in services).toBeTruthy()
    expect('loginByAuth' in services).toBeTruthy()
})