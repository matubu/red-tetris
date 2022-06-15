import { emptyBoard, Player } from './Player.js'

test("emptyBoard", () => {
	expect(emptyBoard().length).toBe(20);
	expect(emptyBoard()[0].length).toBe(10);
	expect(emptyBoard()[0][0]).toBe(0);
	expect(emptyBoard()[19][9]).toBe(0);
})