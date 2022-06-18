import { emptyBoard } from "./emptyBoard.js";

export function makeShadow(currentShape, layer) {
	let copy = currentShape.clone();
	copy.colorid = 8;
	while (copy.tick(layer))
		;
	return copy;
}

export class Player {
	constructor(io, username, bot, client, room) {
		this.io = io;
		this.client = client;
		this.username = username;
		this.isbot = bot;
		this.room = room;
		this.sequence = room.sequence;

		this.gameover = false;
		this.currShape = undefined;
		this.currShapeIdx = 0;
		this.layer = emptyBoard();
		this.board = emptyBoard();
	
		this.score = 0;
		this.lines = 0;

		this.addedLinesNextTurn = 0;
	}

	sendGameData() {
		let nextShape = this.sequence.get(this.currShapeIdx);

		this.client.emit(`gameInfo:${this.room.name}`, {
			clientId: this.client.id,
			currShape: this.currShape,
			nextShape,
			board: this.board,
			...(this.isbot ? {} : {
				scores: {
					score: this.score,
					lines: this.lines
				},
				indestructibleLines: this.addedLinesNextTurn
			})
		});
	}

	sendLayerData() {
		let heights = new Array(10).fill().map((_, x) => {
			for (let y in this.layer)
				if (this.layer[y][x] && this.layer[y][x] != 8)
					return (+y);
			return (20);
		})

		this.client.in(`${this.room.name}+human`).emit(
			`gameInfo:${this.room.name}`, {
				clientId: this.client.id,
				heights,
				username: this.username,
				scores: {
					score: this.score,
					lines: this.lines
				}
			}
		)
	}

	sound(track) {
		this.client.emit(`sound:${this.room.name}`, track)
	}

	addLinesToBoard(nbLines) {
		// let copyBoard = this.layer;
		// for (let i = 0 ; i < nbLines ; i++) {
		// 	copyBoard.shift();
		// 	copyBoard.push(new Array(10).fill(9));
		// }
		// this.layer = copyBoard;
	}

	addIndestructibleLine(nbLines) {
		this.addedLinesNextTurn += nbLines;
	}

	applyTetriminos() {
		this.layer = this.currShape.drawOn(this.layer);
		this.currShape = undefined;

		let filteredLayer = this.layer
			.filter(row => row.some(cell => cell == 0 || cell == 8 || cell == 9));
		
		let n = this.layer.length - filteredLayer.length;
		// Make n - 1 lines indestructible for all players
		this.room.makeIndestructibleLines(n - 1, this);
		this.score += [0, 100, 300, 500, 800][n];
		this.sound(['landing', 'single', 'double', 'triple', 'tetris'][n])
		while (filteredLayer.length != this.layer.length)
		{
			filteredLayer.unshift(new Array(10).fill(0));
			++this.lines;
		}
		this.layer = filteredLayer;
		this.sendLayerData();
	}

	newTetriminos() {
		if (this.currShape)
			this.applyTetriminos();

		this.addLinesToBoard(this.addedLinesNextTurn);
		this.addedLinesNextTurn = 0;

		this.currShape = this.room.sequence.get(this.currShapeIdx++).constructPiece();

		if (this.currShape.intersect(this.layer))
		{
			this.gameover = true;
			this.currShape = undefined;
			this.io.in(this.room.name).emit(`gameInfo:${this.room.name}`, {
				clientId: this.client.id,
				gameover: true
			});
			this.room.gameOverList.push(this);
			return ;
		}
	}

	draw(send = true) {
		this.board = this.layer.map(row => [...row]);

		if (this.currShape)
		{
			this.board = makeShadow(this.currShape, this.layer).drawOn(this.board);
			this.board = this.currShape.drawOn(this.board);
		}

		if (send)
			this.sendGameData();
	}

	tick() {
		if (this.gameover)
			return ;

		let newTetriminos = !this?.currShape?.tick?.(this.layer);
		if (newTetriminos)
			this.newTetriminos();

		this.draw(newTetriminos || !this.isbot);
	}

	applyEvent(keys) {
		if (this.currShape == undefined)
			return ;

		let newTetriminos = false;

		const applyKey = (key) => {
			if (key == 'ArrowLeft')
			{
				this.currShape.move(this.layer, -1, 0);
				this.sound('move');
			}
			else if (key == 'ArrowRight')
			{
				this.currShape.move(this.layer, 1, 0);
				this.sound('move');
			}
			else if (key == 'ArrowUp')
			{
				this.currShape.rotateLeft(this.layer);
				this.sound('rotate');
			}
			else if (key == 'ArrowDown')
			{
				this.currShape.move(this.layer, 0, 1);
				this.score += 1;
				this.sound('soft-drop');
			}
			else if (key == ' ')
			{
				while (this.currShape.move(this.layer, 0, 1))
					this.score += 2;
				this.newTetriminos();
				newTetriminos = true;
				this.sound('hard-drop');
			}
			else
				return ;
		}

		if (keys instanceof Array)
			for (let key of keys)
				applyKey(key);
		else
			applyKey(keys);

		this.draw(!this.isbot || newTetriminos);
	}
}