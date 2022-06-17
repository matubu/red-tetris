import { emptyBoard, makeShadow } from './Player.js'
import { TETRIMINOS } from './Piece.js'


test("newPiece + clone", () => {
	let newPiece = TETRIMINOS[0].constructPiece();
	expect(newPiece).not.toBe(newPiece.clone());
});

test("emptyBoard", async () => {
	let newPiece = TETRIMINOS[0].constructPiece();
	let board = emptyBoard();

	expect(makeShadow(newPiece, board)).not.toBe(newPiece);
	expect(emptyBoard().length).toBe(20);
	expect(emptyBoard()[0].length).toBe(10);
	expect(emptyBoard()[0][0]).toBe(0);
	expect(emptyBoard()[19][9]).toBe(0);
});