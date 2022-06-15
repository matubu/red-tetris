import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@red-tetris.pnwh0lt.mongodb.net/?retryWrites=true&w=majority`;
export const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
	keepAlive: true
});

await client.connect();

export const db = client.db("red-tetris");
export const scoresDB = db.collection("scores");