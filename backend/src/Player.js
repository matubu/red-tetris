import { scoresDB } from './mongodb.js'

function emptyBoard() {
	let board = new Array(20)
		.fill()
		.map(() => new Array(10).fill(0));
	return (board)
}

function makeShadow(currentShape, layer) {
	let copy = currentShape.clone()
	copy.colorid = 8
	while (copy.tick(layer))
		;
	return copy;
}

function draw(currentShape, layer) {
	let board;
	let shadow = makeShadow(currentShape, layer);

	board = shadow.drawOn(layer)
	board = currentShape.drawOn(board)
	return board
}

export class Player {
	constructor(io, username, socket, room) {
		this.io = io;
		this.socket = socket;
		this.username = username;
		this.room = room;
		this.sequence = room.sequence;

		this.gameover = false
		this.currShape = undefined;
		this.currShapeIdx = 0;
		this.layer = emptyBoard();
		this.board = emptyBoard();
	
		this.score = 0;
		this.lines = 0;
	}

	sendGameData() {
		//let nextShape = this.sequence.get(this.currShapeIdx);

		this.socket.emit(`gameInfo:${this.room.name}`, {
			clientId: this.socket.id,
			board: this.board,
			scores: {
				score: this.score,
				lines: this.lines
			}
		});
	}

	sendLayerData(socket) {
		let heights = new Array(10).fill().map((_, x) => {
			for (let y in this.layer)
				if (this.layer[y][x] && this.layer[y][x] != 8)
					return (+y)
			return (20)
		})

		socket.emit(
			`gameInfo:${this.room.name}`, {
				clientId: this.socket.id,
				heights,
				username: this.username,
				scores: {
					score: this.score,
					lines: this.lines
				}
			}
		)
	}

	tick() {
		if (this.gameover)
			return ;

		if (this.currShape == undefined)
		{
			this.currShape = this.room.sequence.get(this.currShapeIdx++).constructShape()
		
			if (this.currShape.intersect(this.layer))
			{
				this.gameover = true;
				this.currShape = undefined;
				this.io.in(this.room.name).emit(`gameInfo:${this.room.name}`, {
					clientId: this.socket.id,
					gameover: true
				});
				scoresDB.insertOne({
					username: this.username,
					score: this.score
				})
				return ;
			}
		}
		
		let moved = this.currShape.tick(this.layer)
		this.board = draw(this.currShape, this.layer);

		if (!moved)
		{
			this.layer = this.currShape.drawOn(this.layer)
			this.currShape = undefined

			let filteredLayer = this.layer
				.filter(row => row.some(cell => cell == 0));
			this.score += [0, 100, 300, 500, 800][this.layer.length - filteredLayer.length]
			while (filteredLayer.length != this.layer.length)
			{
				filteredLayer.unshift(new Array(10).fill(0))
				++this.lines;
			}
			this.layer = filteredLayer

			this.sendLayerData(this.socket.in(this.room.name))
		}
		this.sendGameData();
	}

	applyEvent(key) {
		if (this.currShape == undefined)
			return ;

		if (key == 'ArrowLeft')
			this.currShape.move(this.layer, -1, 0)
		else if (key == 'ArrowRight')
			this.currShape.move(this.layer, 1, 0)
		else if (key == 'ArrowUp')
			this.currShape.rotateLeft(this.layer)
		else if (key == 'ArrowDown')
		{
			this.currShape.move(this.layer, 0, 1)
			this.score += 1
		}
		else if (key == ' ')
			while (this.currShape.move(this.layer, 0, 1))
				this.score += 2;
		else
			return ;

		this.board = draw(this.currShape, this.layer);
		this.sendGameData()
	}
}