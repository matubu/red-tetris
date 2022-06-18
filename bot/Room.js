import * as features from "./features.js";
import { draw, get_heights, intersect, remove_full_lines, rotate } from "./utils.js";

function get_clean_board(data) {
	let board = draw(
		[data.currShape.x, data.currShape.y],
		data.currShape.shape,
		data.board,
		0
	);

	for (let y in board)
		for (let x in board[y])
			if (board[y][x] === 8)
				board[y][x] = 0;

	return (board);
}

export class Room {
	/** @param {Bot} bot */
	/** @param {string} roomname */
	constructor(bot, roomname) {
		/** @type {import('./Bot.js').Bot} socket */
		this.bot = bot;
		this.roomname = roomname;
		this.listeners = [];
	}

	on(event, listener) {
		this.bot.socket.on(event, listener);
		this.listeners.push([event, listener]);
	}
	do(key) {
		this.bot.socket.emit(`event:${this.roomname}`, key)
	}
	calculateScore(board) {
		let heights = get_heights(board);

		return (
			features.feature_bumps(heights, this.bot.genes)
			+ features.feature_heights(heights, this.bot.genes)
			+ features.feature_holes(board, this.bot.genes)
		);
	}
	/** @param currShape currShape with rotation applied */
	/** @param x the x position of the piece */
	get_score(board, currShape, x) {
		let y = -1;
		while (!intersect([x, y], currShape, board))
			++y;
		if (y === -1)
			return ({ score: -Infinity });
		--y;

		let [newBoard, clearedLines] = remove_full_lines(
			draw([x, y], currShape, board)
		);

		let points = features.feature_points(clearedLines, this.bot.genes);

		return ({
			board: newBoard,
			score: this.calculateScore(newBoard) + points,
			points
		});
	}
	join() {
		this.bot.socket.emit('joinRoom', {
			user: this.bot.botname,
			name: this.roomname,
			bot: true
		})

		this.on(`gameInfo:${this.roomname}`, (data) => {
			if (data.clientId !== this.bot.socket.id)
				return ;

			if (data.gameover || data.currShape === undefined)
				return ;

			let clean_board = get_clean_board(data);

			// console.log('vvvvvv')
			// if (this.expected)
			// 	console.log(this.expected.map(row => row.join('')).join('\n'));
			
			// console.log('_____')
			// console.log(clean_board.map(row => row.join('')).join('\n'));

			let bestScore = -Infinity;
			let best = {
				x: 0,
				rot: 0,
				// board: clean_board
			};

			let currShape = data.currShape.shape;
			for (let rot_curr = 0; rot_curr < 4; ++rot_curr)
			{
				let nextShape = data.nextShape.shape;
				for (let rot_next = 0; rot_next < 4; ++rot_next)
				{
					for (let x_curr = 0; x_curr < 10; ++x_curr)
					{
						let { board, points } = this.get_score(clean_board, currShape, x_curr);

						if (!board)
							continue ;

						for (let x_next = 0; x_next < 10; ++x_next)
						{
							let { score } = this.get_score(board, nextShape, x_next);

							score += points;
							if (score > bestScore)
							{
								best = {
									x: x_curr - data.currShape.x,
									rot: rot_curr - data.currShape.rotation,
									// board
								};
								bestScore = score;
							}
						}
					}
					nextShape = rotate(nextShape);
				}
				currShape = rotate(currShape);
			}

			// console.log();
			// console.log(this.bot.botname);
			// console.log(best.board.map(row => row.join('')).join('\n'));
			// console.log('-'.repeat(10));
			// this.expected = best.board;

			let cmds = []

			if (best.x < 0)
				while (best.x++)
					cmds.push('ArrowLeft');
			else
				while (best.x--)
					cmds.push('ArrowRight');

			while (best.rot--)
				cmds.push('ArrowUp');

			// cmds.push(' ');

			this.do(cmds);
		})
	}
	leave() {
		this.bot.socket.emit('leaveRoom');
		for (let [event, listener] of this.listeners)
			this.bot.socket.removeListener(event, listener);
		this.listeners = [];

		this.onleave();
	}
}
