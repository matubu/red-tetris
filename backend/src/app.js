// import { connect } from './mongodb.js'
import { Server } from "socket.io";
import { Game } from './Game.js';

// let db = await connect()

const io = new Server({
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

let rooms = new Map();

export function deleteRoom(roomName) {
	rooms.delete(roomName);
}

io.on("connection", (socket) => {

	socket.on('initgame', (roomname) => {
		let currRoom = rooms.get(roomname);

		if (currRoom == undefined || !currRoom.players.has(socket.id))
			socket.emit(`notauthorized:${roomname}`)
	})

	socket.on('joinRoom', ({ user: username, name: roomname }) => {

		if (username === undefined || username === '')
			return ;

		if (!rooms.has(roomname))
			rooms.set(roomname, new Game(io, roomname, 'earth'));

		let room = rooms.get(roomname);

		if (room.started === true)
		{
			socket.emit('gameHasStarted');
			return ;
		}

		room.addPlayer(username, socket)

		room.sendUsersList()

		socket.on(`start:${roomname}`, () => {
			io.in(roomname).emit(`start:${roomname}`);
			room.launch();
		})

		socket.on(`gameMode:${roomname}`, (gameMode) => {
			let newGameMode = gameMode ?? room.gameMode

			room.gameMode = newGameMode
			io.in(roomname).emit(`gameMode:${roomname}`, newGameMode);
		})

		// Disconnects
		// socket.on('leaveRoom', () => room.removePlayer(socket))
		// socket.on('disconnect', () => room.removePlayer(socket))

	})

});

io.listen(4000);