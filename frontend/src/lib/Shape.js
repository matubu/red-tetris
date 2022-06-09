class Shape {
	constructor(colorid, shape) {
		this.x = 5 - Math.ceil(shape.length / 2)
		this.y = -shape.length
		this.colorid = colorid
		this.shape = shape.map(row => [...row])
	}
	itersect(board) {
		if (
				this.x < 0
				|| this.x + this.shape.length > 10
				|| this.y + this.shape.length > 20
			)
			return (true)
		return (false)
	}
	rotateLeft() {
		let shape = this.shape.map(row => [...row])
		for (let y in this.shape)
			for (let x in this.shape[y])
				shape[y][x] = this.shape[this.shape.length - 1 - x][y]
		this.shape = shape
	}
	rotateRight() {
		this.rotateLeft()
		this.rotateLeft()
		this.rotateLeft()
	}
	move(board, ox, oy) {
		this.x += ox
		this.y += oy
		if (this.itersect(board))
		{
			this.x -= ox;
			this.y -= oy;
			return (false)
		}
		return (true)
	}
	tick(board) {
		return this.move(board, 0, 1)
	}
	drawOn(board) {
		for (let y in this.shape)
		{
			for (let x in this.shape[y])
			{
				if (this.shape[y][x])
				{
					let py = this.y + +y
					let px = this.x + +x
					if (board[py]?.[px] !== undefined)
					{
						board[py][px] = this.colorid
					}
				}
			}
		}
		return (board)
	}
}

class Tetriminos {
	constructor(colorid, shape) {
		this.colorid = colorid
		this.shape = shape
	}
	constructShape() {
		return (new Shape(this.colorid, this.shape))
	}
}

export const TETRIMINOS = [
	new Tetriminos(
		1,
		[
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		]
	),
	new Tetriminos(
		2,
		[
			[1, 0, 0],
			[1, 1, 1],
			[0, 0, 0]
		]
	),
	new Tetriminos(
		3,
		[
			[0, 0, 1],
			[1, 1, 1],
			[0, 0, 0]
		]
	),
	new Tetriminos(
		4,
		[
			[1, 1],
			[1, 1]
		]
	),
	new Tetriminos(
		5,
		[
			[0, 1, 1],
			[1, 1, 0],
			[0, 0, 0]
		]
	),
	new Tetriminos(
		6,
		[
			[0, 1, 0],
			[1, 1, 1],
			[0, 0, 0]
		]
	),
	new Tetriminos(
		7,
		[
			[1, 1, 0],
			[0, 1, 1],
			[0, 0, 0]
		]
	)
]