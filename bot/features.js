/** @param {number[]} heights */
/** @param {import('./Genes.js').Genes} genes */
export function feature_bumps(heights, genes) {

	let bumps = 0;
	let gaps = 0;
	let pillard = 0;
	let right_most_height = heights[heights.length - 1];

	for (let i = 1; i < 10; ++i)
		bumps += Math.abs(heights[i - 1] - heights[i]);
	for (let i = 0; i < 10; ++i)
	{
		let diffLeft = heights[i] - (heights[i - 1] ?? heights[i]);
		let diffRight = heights[i] - (heights[i + 1] ?? heights[i]);
		if (diffLeft <= 3 || diffRight <= 3)
			++gaps;
		if (diffLeft >= 3 || diffRight >= 3)
			++pillard;
	}
	return (
		genes.get('bumps', bumps, -10)
		+ genes.get('gaps', gaps, -1)
		+ genes.get('pillard', pillard, -1)
		+ genes.get('right_most_height', right_most_height, -1)
	);

}

/** @param {number[]} heights */
/** @param {import('./Genes.js').Genes} genes */
export function feature_heights(heights, genes) {

	let min = Math.min(...heights);
	let avg = heights.reduce((a, b) => a + b, 0) / heights.length;
	let max = Math.max(...heights);

	return (
		genes.get('min-height', min, -2)
		+ genes.get('avg-height', avg, -2)
		+ genes.get('max-height', max, -10)
	);

}

/** @param {import('./Genes.js').Genes} genes */
export function feature_holes(board, genes) {

	let holes = 0;
	let blocked_lines = 0;
	let blocks_hover_lines = 0;

	let blockedLines = new Array(20).fill(0);
	for (let x = 0; x < 10; ++x)
	{
		let start = false;
		let end = false;
		for (let y = 0; y < 20; ++y)
		{
			if (board[y][x])
				start = true;
			else if (start)
			{
				++holes;
				blockedLines[y] = 1;
				end = true;
			}
			if (start && !end)
				blocks_hover_lines++;
		}
	}

	blocked_lines = blockedLines.reduce((a, b) => a + b, 0);

	return (
		genes.get('holes', holes, -1)
		+ genes.get('blocked_lines', blocked_lines, -10)
		+ genes.get('blocks_hover_lines', blocks_hover_lines, -10)
	);

}

/** @param {number} clearedLines */
/** @param {import('./Genes.js').Genes} genes */
export function feature_points(clearedLines, genes) {

	let lines_cleared = clearedLines;
	let not_tetris = clearedLines <= 3;
	let lines_to_others = Math.max(clearedLines - 1, 0);
	let tetris = clearedLines === 4;

	return (
		genes.get('lines_cleared', lines_cleared, 1)
		+ genes.get('not_tetris', not_tetris, -2)
		+ genes.get('lines_to_others', lines_to_others, 2)
		+ genes.get('tetris', tetris, 20)
	)

}