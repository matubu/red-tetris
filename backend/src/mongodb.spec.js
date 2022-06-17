import { client } from './mongodb'

test("db connect", () => {
	client.close();
})