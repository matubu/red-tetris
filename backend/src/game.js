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

function	sendGameData(io, socket, board) {
	io.in(socket.room.name).emit(`gameInfo:${socket.room.name}`, {
		clientId: socket.id,
		board
	});
}

export function launchGame(io, socket) {
	console.log('lauchGame ', socket.username, socket.room);

	let gameover = false
	let currentShape;
	let i = 0;
	let layer = emptyBoard();
	let board = emptyBoard();

	let score = 0;
	let level = 0;
	let lines = 0;

	let interval = setInterval(() => {
		if (currentShape == undefined)
		{
			let newShape = TETRIMINOS[i++ % TETRIMINOS.length]
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
		}
		sendGameData(io, socket, board)
	}, 500)

	socket.on('leaveRoom', () => {
		console.log(`${socket.room.name}`, 'leaveRoom -> ', socket.id);
		clearInterval(interval)
	})
	socket.on('disconnect', () => {
		console.log(`${socket.room.name}`, 'disconnect -> ', socket.id);
		clearInterval(interval)
	})
	
	// Apply event from user
	socket.on(`event:${socket.room.name}`, (key) => {
		console.log(`${socket.room.name}`, key);
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
		sendGameData(io, socket, board)
	})
}