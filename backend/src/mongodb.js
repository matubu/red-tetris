import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@red-tetris.pnwh0lt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
	keepAlive: true
});

async function connect() {
	return new Promise(resolve => {
		client.connect(err => {
			const db = client.db("red-tetris");
			// perform actions on the collection object
			resolve(db);
		})
	})
}

export const db = await connect();
export const scoresDB = db.collection("scores");