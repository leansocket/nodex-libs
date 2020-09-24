import mysql from 'mysql';
import { MySql, Connection } from "../src/mysql";

test('Test Connection class', async () => {
    const query = jest.fn()
    const conn = new Connection({
        query
    })

    conn.query('select * from user')
    expect(query).toBeCalled()
})

test('Test Mysql class', async () => {

    jest.spyOn(mysql, 'createPool')

    const options = {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'test'
    }

    const db = new MySql()
    db.init(options)
    expect(mysql.createPool).toBeCalledWith(options)
})