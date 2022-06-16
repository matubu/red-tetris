export function emptyBoard() {
	let board = new Array(20)
		.fill()
		.map(() => new Array(10).fill(0));
	return (board);
}

export function makeShadow(currentShape, layer) {
	let copy = currentShape.clone();
	copy.colorid = 8;
	while (copy.tick(layer))
		;
	return copy;
}

export class Player {
	constructor(io, username, client, room) {
		this.io = io;
		this.client = client;
		this.username = username;
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
			board: this.board,
			scores: {
				score: this.score,
				lines: this.lines
			},
			nextShape,
			indestructibleLines: this.addedLinesNextTurn
		});
	}

	sendLayerData(client) {
		let heights = new Array(10).fill().map((_, x) => {
			for (let y in this.layer)
				if (this.layer[y][x] && this.layer[y][x] != 8)
					return (+y);
			return (20);
		})

		client.emit(
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
		let copyBoard = this.layer;
		for (let i = 0 ; i < nbLines ; i++) {
			copyBoard.shift();
			copyBoard.push(new Array(10).fill(9));
		}
		this.layer = copyBoard;
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
		this.sendLayerData(this.client.in(this.room.name));
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

	draw() {
		this.board = this.layer.map(row => [...row]);

		if (this.currShape)
		{
			this.board = makeShadow(this.currShape, this.layer).drawOn(this.board);
			this.board = this.currShape.drawOn(this.board);
		}

		this.sendGameData();
	}

	tick() {
		if (this.gameover)
			return ;

		if (!this?.currShape?.tick?.(this.layer))
			this.newTetriminos();

		this.draw();
	}

	applyEvent(key) {
		if (this.currShape == undefined)
			return ;

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
			this.sound('hard-drop');
		}
		else
			return ;

		this.draw();
	}
}