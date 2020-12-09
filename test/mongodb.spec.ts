import { Mongodb } from "../src/mongodb";

test('Test Mongodb class', async (done) => {
    const mongoOptions = {
        uri: 'mongodb://127.0.0.1:27017',
        database: 'test',
        useUnifiedTopology: true,
        useNewUrlParser: true
    }

    new Mongodb(mongoOptions, async function (client) {
        console.log('client', client)
        const data = await client.query(db => db.collection('users').find().toArray());
        console.log(data);
        done()
    });
})
