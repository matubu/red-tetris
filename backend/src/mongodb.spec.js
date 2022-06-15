import { client, db, scoresDB } from './mongodb'

test("db connect", () => {
	client.close();
})