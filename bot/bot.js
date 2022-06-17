import { io } from "socket.io-client";

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
				return (-y);
}

function calculateCost(board) {
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
		cost / 2
		+ blockedLines.reduce((a, b) => a + b, 0) * 5
		+ getHeight(board) * 2
	);
}

function removeFullLines(board) {
	let filtered = board.filter(row => row.some(cell => cell == 0));

	let n = board.length - filtered.length;

	while (filtered.length != board.length)
		filtered.unshift(new Array(10).fill(0));

	return ([filtered, n]);
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
		let cost = calculateCost(newBoard);

		return {
			cost, // number of blocked empty block
			points, // number of points won
			board: newBoard // board state
		}
	}
	join() {
		console.log(this.bot.botname, 'join', this.roomname);

		this.bot.socket.emit('joinRoom', {
			user: this.bot.botname,
			name: this.roomname,
			bot: true
		})

		this.on(`start:${this.roomname}`, () => {
			console.log(this.bot.botname, 'started to play in', this.roomname);
		})

		// let cidx = undefined;

		this.on(`gameInfo:${this.roomname}`, (data) => {
			if (data.clientId !== this.bot.socket.id)
				return ;

			if (data.gameover)
			{
				this.leave();
				return ;
			}

			// let newCidx = `${data.currShape.colorid}${data.nextShape.colorid}`
			// if (cidx === newCidx)
			// 	return ;
			// cidx = newCidx;

			// console.log('cidx', newCidx);
			// console.log('curr shape', data.currShape);

			let bestCost = Infinity;
			let bestPoints = 0;
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
					let { cost, points, board } = this.test(currShape, x);

					if (
						cost < bestCost ||
						(cost == bestCost && points > bestPoints)
					)
					{
						best = {
							x: x - data.currShape.x,
							rot: rot - data.currShape.rotation,
							board
						};
						bestCost = cost;
						bestPoints = points;
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

			cmds.push(' ');

			this.do(cmds);
		})
	}
	leave() {
		console.log(this.bot.botname, 'leave', this.roomname);

		this.bot.socket.emit('leaveRoom');
		for (let [event, listener] of this.listeners)
			this.bot.socket.removeListener(event, listener);
		this.listeners = [];

		this.onleave();


		console.log();
		// console.log();
		// for (let row of data.currShape.shape)
		// 	console.log(row.map(cell => cell ? '██' : '  ').join(''));
		// console.log('---');
		for (let row of this.board)
			console.log(row.map(cell => cell ? '██' : '  ').join(''));
	}
}

export class Bot {
	constructor(botname) {
		/** @type {import('socket.io-client').Socket} socket */
		this.socket = io(`http://localhost:4000`);

		this.botname = botname;

		this.room = undefined;

		this.socket.on("connect", () => console.log(botname, 'connected'))
		this.socket.on("connect_error", () => console.log(botname, 'cannot connect'));
		this.socket.on("disconnect", () => console.log(botname, 'disconnected'));

		this.start_bot();
	}

	start_bot() {
	
		this.socket.on('roomList', (rooms) => {

			if (this.room)
				return ;

			let roomname = rooms.sort(() => Math.random() - 0.5)[0]?.name;

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

			this.room.on(`restart:${roomname}`, () => this.room.leave());
			this.room.on(`owner:${roomname}`, () => this.room.leave())

		})
	
		this.socket.emit('getRoomList');
	}
}