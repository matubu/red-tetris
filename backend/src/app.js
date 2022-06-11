// import { connect } from './mongodb.js'
import { Server } from "socket.io";
import { launchGame } from './game.js';

// import { gameRoom } from "./gameRoom.js"

// let db = await connect()

const io = new Server({
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

let rooms = new Map();

class Player {
	constructor(_socket/*, _game*/) {
		this.username = _socket.username;
		this.socket = _socket;
		// this.game = _game;
		this.board = undefined;
	}
}

class Game {
	constructor(_nameRoom, _gameMode) {
		this.name = _nameRoom;
		this.gameMode = _gameMode;
		this.pieceSequence = this.makePieceSequence();
		this.started = false;
		this.players = new Map() // Array of Player
	}

	makePieceSequence() {
		let Iterations = 32;
		let sequence = [];
		while (Iterations) {
			let tetriminos = [0, 1, 2, 3, 4, 5, 6]
			let currentIndex = tetriminos.length, randomIndex;
	
			// While there remain elements to shuffle.
			while (currentIndex != 0) {
	
				// Pick a remaining element.
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex--;
	
				// Swap two element with the random index
				[tetriminos[currentIndex], tetriminos[randomIndex]] = [tetriminos[randomIndex], tetriminos[currentIndex]];
			}
			sequence.push(...tetriminos);
			Iterations--;
		}
		return sequence;
	}

	sendUsersList() {
		let users = this.getPlayerList().map(player => player.username);
		console.log(users);
		io.in(this.name).emit(`join:${this.name}`, users);
	}

	addPlayer(socket) {
		socket.join(this.name);
		this.players.set(socket.id, new Player(socket))
	}
	getPlayerList() {
		return [...this.players.values()]
	}
	removePlayer(socket) {
		console.log('removePlayer', this);
		socket.leave(this.name)
		this.players.delete(socket.id)
		this.sendUsersList()
	}
}

io.on("connection", (socket) => {

	console.log("connection socket", socket.id)

	// Init game for user
	socket.removeAllListeners('initgame')
	socket.on('initgame', (roomname) => {
		let currRoom = rooms.get(roomname);

		if (currRoom == undefined || !currRoom.players.has(socket.id))
		{
			socket.emit(`notauthorized:${roomname}`)
			return ;
		}
		currRoom.started = true;
		launchGame(io, socket, currRoom);
	})

	socket.on('joinRoom', (room) => {

		// Make sure user as an username
		if (room.user === undefined || room.user === '') {
			console.log('here');
			return ;
		}

		// If your do not exists yet create it
		if (!rooms.has(room.name))
			rooms.set(room.name, new Game(room.name, 'earth'));
	
		// Check if game has already started
		let currRoom = rooms.get(room.name);
		if (currRoom.started === true) {
			socket.emit('gameHasStarted');
			return ;
		}

		socket.username = room.user;

		currRoom.addPlayer(socket)

		currRoom.sendUsersList()

		// Start the game on room
		socket.on(`start:${currRoom.name}`, () => {
			io.in(room.name).emit(`start:${room.name}`);
		})

		// Change game mode
		socket.on(`gameMode:${currRoom.name}`, (gameMode) => {
			let newGameMode = gameMode ?? rooms.get(currRoom.name).gameMode
			// console.log('newGameMode', newGameMode)
			rooms.get(currRoom.name).gameMode = newGameMode
			io.in(currRoom.name).emit(`gameMode:${currRoom.name}`, newGameMode);
		})

		// Disconnects
		socket.on('leaveRoom', () => currRoom.removePlayer(socket))
		socket.on('disconnect', () => currRoom.removePlayer(socket))
	})

});

io.listen(4000);