import { Mongodb } from "../src/mongodb";

test('Test Mongodb class', async () => {
    const mongoOptions = {
        uri: 'mongodb://127.0.0.1：27017',
        database: 'test',
        options: { useUnifiedTopology: true, useNewUrlParser: true }
    }

    const mongoInstance = new Mongodb(mongoOptions);
    const data = await mongoInstance.query(db => db.collection('user').find().toArray());
    console.log(data);
})
