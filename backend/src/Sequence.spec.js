import { Sequence } from "./Sequence.js";
import { Tetriminos } from './Piece.js'

test("new Sequence", () => {
	let sequence = new Sequence(1);

	expect(sequence.sequence.sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
	for (let i = 0; i < 7; ++i)
		expect(sequence.get(0)).toBeInstanceOf(Tetriminos);
})