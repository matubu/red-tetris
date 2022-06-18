export function get_heights(board) {
	return new Array(10)
		.fill()
		.map((_, x) => {
			let y = 0
			for (; y < 20; ++y)
				if (board[y][x])
					break ;
			return (20 - y);
		})
}

export function intersect([ox, oy], shape, board) {
	for (let y in shape)
	{
		for (let x in shape[y])
		{
			let cell = shape[y][x]
			if (!cell)
				continue ;

			let rx = ox + +x;
			let ry = oy + +y;
			if (
				rx < 0
				|| rx >= board[0].length
				|| ry >= board.length
				|| board?.[ry]?.[rx]
			)
				return (true);
		}
	}
	return (false);
}

export function draw([ox, oy], shape, board, color = 1) {
	let copyBoard = board.map(row => [...row]);

	for (let y in shape)
	{
		for (let x in shape[y])
		{
			if (shape[y][x])
			{
				let py = oy + +y;
				let px = ox + +x;
				if (copyBoard[py]?.[px] !== undefined)
					copyBoard[py][px] = color;
			}
		}
	}

	return (copyBoard);
}

export function remove_full_lines(board) {
	let filtered = board.filter(row => row.some(cell => cell == 0));

	let n = board.length - filtered.length;

	while (filtered.length != board.length)
		filtered.unshift(new Array(10).fill(0));

	return ([filtered, n]);
}

export function rotate(shape) {
	let newShape = shape.map(row => [...row]);
	for (let y in shape)
		for (let x in shape[y])
			newShape[y][x] = shape[shape.length - 1 - x][y];
	return (newShape);
}