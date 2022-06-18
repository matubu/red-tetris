import { io } from "socket.io-client";

// TODO take in account next piece
// TODO learn

function intersect([ox, oy], shape, board) {
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

function draw([ox, oy], shape, board) {
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
					copyBoard[py][px] = 1;
			}
		}
	}

	return (copyBoard);
}

function getHeight(board) {
	for (let y = 0; y < 20; ++y)
		for (let x = 0; x < 10; ++x)
			if (board[y][x])
				return (20 - y);
}

function removeFullLines(board) {
	let filtered = board.filter(row => row.some(cell => cell == 0));

	let n = board.length - filtered.length;

	while (filtered.length != board.length)
		filtered.unshift(new Array(10).fill(0));

	return ([filtered, n]);
}

export class Genes {
	constructor(features = {}) {
		this.features = features;
	}
	mutate() {
		let mutated = new Genes();
		for (let key of Object.keys(this.features))
			mutated.features[key] = 
				this.features[key]
					+ (Math.random() - .5) * 8;
		return (mutated);
	}
	get(feature) {
		return (this.features[feature] ??= (Math.random() - .5) * 100);
	}
}

class Room {
	/** @param {Bot} bot */
	/** @param {string} roomname */
	constructor(bot, roomname) {
		/** @type {Bot} socket */
		this.bot = bot;
		this.roomname = roomname;
		this.listeners = [];

		this.board = new Array(20).fill().map(() => new Array(10).fill(0));
	}

	on(event, listener) {
		this.bot.socket.on(event, listener);
		this.listeners.push([event, listener]);
	}
	do(key) {
		this.bot.socket.emit(`event:${this.roomname}`, key)
	}
	calculateScore(board, points) {
		let cost = 0;
		let blockedLines = new Array(20).fill(0);
	
		for (let x = 0; x < 10; ++x)
		{
			let start = false;
			for (let y = 0; y < 20; ++y)
			{
				if (board[y][x])
					start = true;
				else if (start)
				{
					++cost;
					blockedLines[y] = 1;
				}
			}
		}
		return (
			([0, 100, 300, 500, 800][points] * this.bot.genes.get('score'))
			+ (cost * this.bot.genes.get('cost'))
			+ (blockedLines.reduce((a, b) => a + b, 0) * this.bot.genes.get('line_cost'))
			+ (getHeight(board) * this.bot.genes.get('height'))
		);
	}
	/** @param currShape currShape with rotation applied */
	/** @param x the x position of the piece */
	test(currShape, x) {
		if (intersect([x, 0], currShape, this.board))
			return {
				cost: Infinity,
				points: 0,
				board: this.board
			}

		let y = 0;
		while (!intersect([x, y], currShape, this.board))
			++y;
		--y;
		// console.log(y, currShape);

		let [newBoard, points] = removeFullLines(
			draw([x, y], currShape, this.board)
		);
		// console.log('y', y, newBoard)
		let score = this.calculateScore(newBoard, points);

		return {
			score,
			board: newBoard // board state
		}
	}
	join() {
		// console.log(this.bot.botname, 'join', this.roomname);

		this.bot.socket.emit('joinRoom', {
			user: this.bot.botname,
			name: this.roomname,
			bot: true
		})

		// this.on(`start:${this.roomname}`, () => {
		// 	console.log(this.bot.botname, 'started to play in', this.roomname);
		// })

		this.on(`gameInfo:${this.roomname}`, (data) => {
			if (data.clientId !== this.bot.socket.id)
				return ;

			if (data.gameover || data.currShape === undefined)
				return ;

			let bestScore = -Infinity;
			let best = {
				x: 0,
				rot: 0,
				board: this.board
			};


			let currShape = data.currShape.shape;
			for (let rot = 0; rot < 4; ++rot)
			{
				for (let x = 0; x < 10; ++x)
				{
					let { score, board } = this.test(currShape, x);

					if (score > bestScore)
					{
						best = {
							x: x - data.currShape.x,
							rot: rot - data.currShape.rotation,
							board
						};
						bestScore = score;
					}
				}

				/** Rotate */
				let newShape = currShape.map(row => [...row]);
				for (let y in currShape)
					for (let x in currShape[y])
						newShape[y][x] = currShape[currShape.length - 1 - x][y];
				currShape = newShape;
			}

			this.board = best.board;

			// console.log(best.x);
			// console.log(best.rot);
			// console.log('points', bestPoints);


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
		// console.log(this.bot.botname, 'leave', this.roomname);

		this.bot.socket.emit('leaveRoom');
		for (let [event, listener] of this.listeners)
			this.bot.socket.removeListener(event, listener);
		this.listeners = [];

		this.onleave();


		// console.log();
		// console.log();
		// for (let row of data.currShape.shape)
		// 	console.log(row.map(cell => cell ? '██' : '  ').join(''));
		// console.log('---');
		// for (let row of this.board)
		// 	console.log(row.map(cell => cell ? '██' : '  ').join(''));
	}
}

export class Bot {
	constructor(botname) {
		/** @type {import('socket.io-client').Socket} socket */
		this.socket = io(`http://localhost:4000`);

		this.botname = botname;
		this.genes = new Genes();

		this.room = undefined;

		this.socket.on("connect_error", () => console.log(botname, 'cannot connect'));
		this.socket.on("disconnect", () => console.log(botname, 'disconnected'));
	}

	setGenes(genes) {
		this.genes = genes;
	}

	start_bot() {
		return new Promise((resolve) => {
			this.socket.on('roomList', (rooms) => {
	
				if (this.room)
					return ;
	
				let roomname = rooms[0]?.name;
	
				if (roomname === undefined)
					return ;
	
				this.room = new Room(this, roomname)
				this.room.join();

				this.room.onleave = () => {
					setTimeout(() => {
						this.room = undefined;
						this.socket.emit('getRoomList');
					}, 500)
				};

				this.room.on(`endgame:${roomname}`, (data) => {
					// console.log('endgame', data);
					this.room.leave();
					this.socket.removeAllListeners('roomList');
					for (let i in data)
					{
						if (data[i].username === this.botname)
						{
							console.log('resolve', this.botname, i);
							resolve({
								i: +i,
								score: data[i].score,
								height: getHeight(this.room.board),
								genes: this.genes
							});
						}
					}
				})
	
				this.room.on(`restart:${roomname}`, () => this.room.leave());
				this.room.on(`owner:${roomname}`, () => this.room.leave())
	
			})
		
			this.socket.emit('getRoomList');
		})
	}
}