import { makeShadow } from './Player.js';
import { TETRIMINOS } from './Piece.js';
import { emptyBoard } from "./emptyBoard.js";

test('makeShadow', () => {
	let board = emptyBoard();

	let newPiece = TETRIMINOS[0].constructPiece();
	expect(makeShadow(newPiece, board)).not.toBe(newPiece);
})

test("newPiece + clone", () => {
	let newPiece = TETRIMINOS[0].constructPiece();
	expect(newPiece).not.toBe(newPiece.clone());
});