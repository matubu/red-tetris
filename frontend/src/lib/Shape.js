class Shape {
	constructor(colorid, shape) {
		this.x = 5 - Math.ceil(shape.length / 2)
		this.y = -shape.length
		this.colorid = colorid
		this.shape = shape.map(row => [...row])
	}
	itersect(board) {
		for (let y in this.shape)
		{
			for (let x in this.shape[y])
			{
				let cell = this.shape[y][x]
				if (!cell)
					continue ;

				let rx = this.x + +x
				let ry = this.y + +y
				if (
					rx < 0
					|| rx >= 10
					|| ry >= 20
					|| board?.[ry]?.[rx]
				)
					return (true)
			}
		}
		return (false)
	}
	rotateLeft(board) {
		let old_shape = this.shape.map(row => [...row])
		for (let y in this.shape)
			for (let x in this.shape[y])
				this.shape[y][x] = old_shape[this.shape.length - 1 - x][y]
		if (this.itersect(board))
			this.shape = old_shape
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