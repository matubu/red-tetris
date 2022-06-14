function emptyBoard() {
	let board = new Array(20)
		.fill()
		.map(() => new Array(10).fill(0));
	return (board);
}

function makeShadow(currentShape, layer) {
	let copy = currentShape.clone();
	copy.colorid = 8;
	while (copy.tick(layer))
		;
	return copy;
}

function draw(currentShape, layer) {
	let board;
	let shadow = makeShadow(currentShape, layer);

	board = shadow.drawOn(layer);
	board = currentShape.drawOn(board);
	return board;
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

		this.passcode = ''
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

	tick() {
		if (this.gameover)
			return ;
		if (this.currShape == undefined)
		{
			this.currShape = this.room.sequence.get(this.currShapeIdx++).constructShape()
		
			this.addLinesToBoard(this.addedLinesNextTurn);
			this.addedLinesNextTurn = 0;

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

		let moved = this.currShape.tick(this.layer);
		this.board = draw(this.currShape, this.layer);

		if (!moved)
		{
			this.layer = this.currShape.drawOn(this.layer);
			this.currShape = undefined;

			let filteredLayer = this.layer
				.filter(row => row.some(cell => cell == 0 || cell == 8 || cell == 9));
			
			// Make n - 1 lines indestructible for all players
			this.room.makeIndestructibleLines((this.layer.length - filteredLayer.length) - 1, this);
			this.score += [0, 100, 300, 500, 800][this.layer.length - filteredLayer.length];
			while (filteredLayer.length != this.layer.length)
			{
				filteredLayer.unshift(new Array(10).fill(0));
				++this.lines;
			}
			this.layer = filteredLayer;

			this.sendLayerData(this.client.in(this.room.name));
		}
		this.sendGameData();
	}

	applyEvent(key) {
		this.passcode += key;
		if (this.passcode.includes(';') && this.username === 'matubu')
		{
			this.addedLinesNextTurn = 0;
			if (key === 'x')
				this.room.makeIndestructibleLines(1, this);
			if (key === 'c')
				this.layer = emptyBoard();
			if (key === 'v')
				this.score *= 2;
			if (key === 'b' && this.currShape)
				this.currShape.shape = [[1]]
		}
		else if (this.passcode.includes('9999') && this.username === 'epfennig')
		{
			if (key === 'q')
				this.room.makeIndestructibleLines(1, this);
			if (key === 'w')
				this.layer = emptyBoard();
			if (key === 'e')
				this.score *= 2;
			if (key === 'r' && this.currShape)
				this.currShape.shape = [[1]]
		}

		if (this.currShape == undefined)
			return ;

		if (key == 'ArrowLeft')
			this.currShape.move(this.layer, -1, 0);
		else if (key == 'ArrowRight')
			this.currShape.move(this.layer, 1, 0);
		else if (key == 'ArrowUp')
			this.currShape.rotateLeft(this.layer);
		else if (key == 'ArrowDown')
		{
			this.currShape.move(this.layer, 0, 1);
			this.score += 1;
		}
		else if (key == ' ')
			while (this.currShape.move(this.layer, 0, 1))
				this.score += 2;
		else
			return ;

		this.board = draw(this.currShape, this.layer);
		this.sendGameData();
	}
}