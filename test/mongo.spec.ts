import { init } from "../src/mongo";

test('Test Mongo class', async (done) => {
    const options = {
        uri: 'mongodb://127.0.0.1:27017',
        database: 'test',
        useUnifiedTopology: true,
        useNewUrlParser: true
    }

    const mongo = await init(options);
    const data = await mongo.query(db => db.collection('users').find().toArray());
    console.log(data);
})
