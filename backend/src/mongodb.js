import { MongoClient, ServerApiVersion } from 'mongodb';

export let db;
export let scoresDB;

export async function connectMongo() {
	const client = new MongoClient(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverApi: ServerApiVersion.v1,
		keepAlive: true
	});
	
	await client;

	db = client.db("red-tetris");
	scoresDB = db.collection("scores");
}