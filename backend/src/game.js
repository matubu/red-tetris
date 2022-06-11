import { TETRIMINOS } from "./Shape.js";

function emptyBoard() {
	let board = new Array(20)
		.fill()
		.map(() => new Array(10).fill(0));
	return (board)
}

function makeShadow(currentShape, layer) {
	let copy = currentShape.clone()
	copy.colorid = 8
	while (copy.tick(layer)) ;
	return copy;
}

function draw(currentShape, layer) {
	let board;
	let shadow = makeShadow(currentShape, layer);

	board = shadow.drawOn(layer)
	board = currentShape.drawOn(board)
	return board
}

function	sendGameData(socket, board, scores) {
	socket.emit(`gameInfo:${socket.room.name}`, {
		clientId: socket.id, // his socket id to identify it in frontend
		board, // contains the board of one player
		scores // contains score and lines
	});
}

function	sendLayerData(io, socket, layer, scores) {
	let heights = new Array(10).fill().map((_, x) => {
		for (let y in layer)
			if (layer[y][x] && layer[y][x] != 8)
				return (+y)
		return (20)
	})

	socket.in(socket.room.name).emit(
		`gameInfo:${socket.room.name}`, {
			clientId: socket.id,
			heights,
			username: socket.username,
			scores
		}
	)
}

export function launchGame(io, socket) {
	// console.log('lauchGame ', socket.username, socket.room);

	let gameover = false
	let currentShape;
	let i = 0;
	let layer = emptyBoard();
	let board = emptyBoard();

	let score = 0;
	let lines = 0;
	let nextShape = undefined;
	let pieceSequence = socket.room.pieceSequence;
	let interval = setInterval(() => {
		nextShape = TETRIMINOS[pieceSequence[i + 1 % pieceSequence.length]]
		if (currentShape == undefined)
		{
			let newShape = TETRIMINOS[pieceSequence[i++ % pieceSequence.length]]
				.constructShape()
		
			if (newShape.intersect(layer))
			{
				gameover = true;
				io.in(socket.room.name).emit(`gameInfo:${socket.room.name}`, {
					clientId: socket.id,
					gameover: true
				});
				clearInterval(interval)
				return ;
			}
			currentShape = newShape
		}
		
		let moved = currentShape.tick(layer)
		board = draw(currentShape, layer);

		if (!moved)
		{
			layer = currentShape.drawOn(layer)
			currentShape = undefined

			let filterLayer = layer
				.filter(row => row.some(cell => cell == 0));
			score += [0, 100, 300, 500, 800][layer.length - filterLayer.length]
			while (filterLayer.length != layer.length)
			{
				filterLayer.unshift(new Array(10).fill(0))
				++lines;
			}
			layer = filterLayer

			sendLayerData(io, socket, layer, { score, lines })
		}
		sendGameData(socket, board, { score, lines }, nextShape);
	}, {
		blackhole: 75,
		sun: 150,
		earth: 400,
		moon: 800
	}[socket.room.gameMode])

	const leaveRoom = () => {
		// console.log(socket.room.name, 'leaveRoom -> ', socket.id);
		socket.removeAllListeners(`event:${socket.room.name}`)
		clearInterval(interval)
	}

	socket.once('leaveRoom', leaveRoom)
	socket.once('disconnect', leaveRoom)
	
	// Apply event from user
	socket.on(`event:${socket.room.name}`, (key) => {
		// console.log(`${socket.room.name}`, key);
		if (currentShape === undefined) return ;
		if (key == 'ArrowLeft')
			currentShape.move(layer, -1, 0)
		else if (key == 'ArrowRight')
			currentShape.move(layer, 1, 0)
		else if (key == 'ArrowUp')
			currentShape.rotateLeft(layer)
		else if (key == 'ArrowDown')
		{
			currentShape.move(layer, 0, 1)
			score += 1
		}
		else if (key == ' ')
			while (currentShape.move(layer, 0, 1))
				score += 2;
		else
			return ;
		board = draw(currentShape, layer);
		sendGameData(socket, board, { score, lines }, nextShape)
	})
}