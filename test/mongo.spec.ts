import { Mongo } from "../src/mongo";

test('Test Mongo class', async (done) => {
    const options = {
        uri: 'mongodb://127.0.0.1:27017',
        database: 'test',
        useUnifiedTopology: true,
        useNewUrlParser: true
    }

    const mongo = new Mongo(options);
    await mongo.connect()
    const data = await mongo.query(db => db.collection('users').find().toArray());
    console.log(data);
})
