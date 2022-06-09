import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@red-tetris.pnwh0lt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

export async function connect() {
	return new Promise(resolve => {
		client.connect(err => {
			const db = client.db("red-tetris");
			// perform actions on the collection object
			resolve(db)
		})
	})
}