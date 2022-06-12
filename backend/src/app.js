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

function sendRoomList(socket) {
	let roomList = [];
	rooms.forEach((val, key) => {
		if (val.started === false)
			roomList.push({name: key, nbPlayer: val.players.size});
	})
	socket.emit('roomList', roomList);
}

io.on("connection", (socket) => {

	socket.on('getRoomList', () => {
		sendRoomList(socket);
	})

	socket.on('initgame', (roomname) => {
		let currRoom = rooms.get(roomname);

		if (currRoom == undefined || !currRoom.players.has(socket.id))
			socket.emit(`notauthorized:${roomname}`)
	})

	socket.on('joinRoom', ({ user: username, name: roomname }) => {

		if (username === undefined || username === '')
		{
			socket.emit('userNameError', `username required`);
			return ;
		}
		if (!/^[a-z0-9_-]{1,16}$/.test(roomname))
		{
			socket.emit('roomNameError', `invalid roomname`);
			return ;
		}

		if (!rooms.has(roomname))
			rooms.set(roomname, new Game(io, roomname, 'earth'));

		let room = rooms.get(roomname);

		if (room.started === true)
		{
			socket.emit('roomNameError', `${roomname} has already started`);
			return ;
		}

		room.addPlayer(username, socket);

		sendRoomList(io);

		room.sendUsersList();

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
		const removePlayer = () => {
			room.removePlayer(socket);
			if (room.players.size == 0)
			{
				room.destroy();
				rooms.delete(roomname);
			}
			sendRoomList(io);
		}
		socket.on('leaveRoom', removePlayer);
		socket.on('disconnect', removePlayer);

	})

});

io.listen(4000);