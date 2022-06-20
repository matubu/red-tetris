import { io } from "socket.io-client";
import { stdout } from 'node:process';
import { Piece } from "../backend/src/Piece.js";

/** @type { Piece }*/
let currentPiece = undefined;
let layer = undefined;

export function makeShadow(piece, x, layer) {
	let copy = piece.clone();
	copy.colorid = 8;
	copy.x = x;
	while (copy.tick(layer))
		;
	return copy;
}

function printBoard(board) {
	console.log('----- Print Board -----')
	for (let i = 0 ; i < board.length ; i++) {
		for (let j = 0 ; j < board[i].length ; j++) {
			stdout.write(String(board[i][j]));
		}
		stdout.write("\n");
	}
	console.log('------------------------')
}

function printShape(shape) {
	console.log('--- Print Shape ---')
	for (let i = 0 ; i < shape.length ; i++) {
		for (let j = 0 ; j < shape[i].length ; j++) {
			stdout.write(String(shape[i][j]));
		}
		stdout.write("\n");
	}
	console.log('------------------')
}

function compareShapes(curr, sended) {
	for (let i = 0 ; i < curr.length ; i++) {
		for (let j = 0 ; j < curr[i].length ; j++) {
			if (curr[i][j] != sended[i][j])
				return false;
		}
	}
	return true;
}

function makeLayer(piece, board, color) {
	let layer = board.map(row => [...row]);
	for (let y = 0 ; y < 20 ; y++) {
		for (let x = 0 ; x < 10 ; x++) {
			if (layer[y][x] === 8)
				layer[y][x] = 0;
		}
	}
	for (let y = 0 ; y < piece.shape.length ; y++)
	{
		for (let x = 0 ; x < piece.shape[y].length ; x++)
		{
			if (piece.shape[y][x])
			{
				let py = piece.y + +y;
				if (piece.colorid === 1)
					py -= 1;
				let px = piece.x + +x;
				if (layer[py]?.[px] !== undefined)
					layer[py][px] = color;
			}
		}
	}
	return layer;
}

function calculateGaps(layer) {
	let	gaps = 0;
	let sum = 0;
	for (let x = 0 ; x < 10 ; x++) {
		gaps = 0;
		let detect = false;
		for (let y = 0 ; y < 20 ; y++) {
			if (layer[y][x] !== 0)
				detect = true;
			if (detect && layer[y][x] === 0) {
				gaps++;
			}
		}
		sum += gaps;
	}
	return sum;
}

function tryShadowing(piece, layer) {
	let found = false;
	let minGaps = 9999999;
	let bestX = 0;
	let bestRotation = 0;
	let minimumY = 999999;
	for (let rota = 0 ; rota < 3 ; rota++) {
		for (let x = 0 ; x < 10 ; x++) {
			let shadow = makeShadow(piece, x, layer);
			let newLayer = makeLayer(shadow, layer, piece.colorid);
			let gaps = calculateGaps(newLayer);
			if (gaps < minGaps) {
				minGaps = gaps;
				bestX = x;
				bestRotation = rota;
			}
		}
		// printShape(piece.shape);
		// console.log(minGaps, bestX, bestRotation);
		piece.rotateLeft(layer);
	}
	console.log('bestRotation ->', bestRotation);
	while (bestRotation) {
		bot.room.do('ArrowUp');
		bestRotation--;
	}
	console.log('bestX ->', bestX);
	for (let x = piece.x ; x != bestX ;) {
		if (x < bestX) {
			bot.room.do('ArrowRight');
			x++;
		}
		else if (x > bestX) {
			bot.room.do('ArrowLeft');
			x--;
		}
	}
}

function tetrisIA(data) {
	if (data.iskeyChange || (currentPiece && layer && compareShapes(currentPiece.shape, data.currShape.shape)))
		return ;
	console.log('----- tetrisIA -----');
	currentPiece = new Piece(data.currShape.colorid, data.currShape.shape);
	let board = data.board;
	layer = makeLayer(currentPiece, board, 0);
	// console.clear();
	tryShadowing(currentPiece, layer);
	// printBoard(layer);
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
	join() {
		console.log(this.bot.botname, 'join', this.roomname);

		this.bot.socket.emit('joinRoom', {
			user: this.bot.botname,
			name: this.roomname,
		})

		this.on(`start:${this.roomname}`, () => {
			console.log(this.bot.botname, 'started to play in', this.roomname);
		})

		this.on(`gameInfo:${this.roomname}`, (data) => {
			if (data.clientId !== this.bot.socket.id)
				return ;

			if (data.gameover)
			{
				printBoard(layer);
				this.leave();
				return ;
			}
			
			tetrisIA(data);
		})
	}
	leave() {
		printBoard(layer);
		console.log(this.bot.botname, 'leave', this.roomname);

		this.bot.socket.emit('leaveRoom');
		for (let [event, listener] of this.listeners)
			this.bot.socket.removeListener(event, listener);
		this.listeners = [];

		this.onleave();
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

			this.room = new Room(this, roomname);
			this.room.join();

			this.room.onleave = () => {
				setTimeout(() => {
					this.room = undefined;
					this.socket.emit('getRoomList');
				}, 500)
			};

			this.room.on(`restart:${roomname}`, () => this.room.leave());
			this.room.on(`owner:${roomname}`, () => this.room.leave());
		})
	
		this.socket.emit('getRoomList');
	}
}

let bot = new Bot(`edracoon-bot`);