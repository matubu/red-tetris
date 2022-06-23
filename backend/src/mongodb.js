import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@red-tetris.pnwh0lt.mongodb.net/?retryWrites=true&w=majority`;

export let db;
export let scoresDB;

export async function connectMongo() {
	const client = new MongoClient(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverApi: ServerApiVersion.v1,
		keepAlive: true
	});

	await client;

	db = client.db("red-tetris");
	scoresDB = db.collection("scores");
}