import { init } from "../src/mongodb";

test('Test Mongodb class', async (done) => {
    const mongoOptions = {
        uri: 'mongodb://127.0.0.1:27017',
        database: 'test',
        useUnifiedTopology: true,
        useNewUrlParser: true
    }

    const mongoInstance = await init(mongoOptions);
    const data = await mongoInstance.query(db => db.collection('users').find().toArray())
    console.log(data)
})
