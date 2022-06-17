import { TETRIMINOS, Tetriminos, Piece } from './Piece.js'

test('Tetriminos.constructPiece', () => {
	expect(TETRIMINOS[0]).toBeInstanceOf(Tetriminos);
	expect(TETRIMINOS[0].constructPiece()).toBeInstanceOf(Piece);
})

test("Piece.clone", () => {
	let piece = TETRIMINOS[0].constructPiece();
	expect(piece).not.toBe(piece.clone());
});

function createTetriminos(shape, x=0, y=0)
{
	let tetriminos = new Tetriminos(
		1,
		y,
		shape		
	).constructPiece();
	tetriminos.x = x;
	return (tetriminos);
}

test("Piece.intersect", () => {
	expect(
		createTetriminos([
			[0, 1, 1],
			[1, 1, 0],
			[0, 0, 0]
		]).intersect([
			[1, 0, 0],
			[0, 0, 1],
			[1, 1, 1]
		])
	).toBe(false)

	expect(
		createTetriminos([
			[0, 1, 1],
			[1, 1, 0],
			[0, 0, 0]
		], 1, 1).intersect([
			[1, 1, 1, 1],
			[1, 1, 0, 0],
			[1, 0, 0, 1]
		])
	).toBe(false)

	expect(
		createTetriminos([
			[0, 1, 1],
			[1, 1, 0],
			[0, 0, 0]
		], 1, 0).intersect([
			[0, 0, 0],
			[0, 0, 1],
			[0, 0, 0]
		])
	).toBe(true)

	expect(
		createTetriminos([
			[0, 1, 1],
			[1, 1, 0],
			[0, 0, 0]
		]).intersect([
			[0, 0, 1, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		])
	).toBe(true)

	expect(
		createTetriminos([
			[0, 1, 1],
			[1, 1, 0],
			[0, 0, 0]
		]).intersect([
			[0, 0],
			[0, 0]
		])
	).toBe(true)
})