export function emptyBoard() {
	let board = new Array(20)
		.fill()
		.map(() => new Array(10).fill(0));
	return (board);
}