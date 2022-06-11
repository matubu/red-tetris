// import { connect } from './mongodb.js'
import { Server } from "socket.io";
import { Game, launchGame } from './Game.js';

// let db = await connect()

const io = new Server({
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

let rooms = new Map();

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