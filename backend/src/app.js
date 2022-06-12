import { Server } from "socket.io";
import { Game } from './Game.js';
import { scoresDB } from './mongodb.js';

const io = new Server({
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

let rooms = new Map();

function sendRoomList(socket) {
	let roomList = [];

	for (let [name, val] of rooms)
		if (val.started === false)
			roomList.push({ name, nbPlayer: val.players.size });

	socket.emit('roomList', roomList);
}

async function sendScores(socket, username) {
	// Top 10 scores ever
	const bestScores = await scoresDB.find({}, {projection: {"_id": false}}).limit(10).sort({ score: -1 }).toArray();
	// Top 10 scores for an username
	const userScores = await scoresDB.find({ username }, {projection: {"_id": false}}).limit(10).sort({ score: -1 }).toArray();

	socket.emit('scoresList', {userScores, bestScores});
}

io.on("connection", (socket) => {

	socket.on('getRoomList', () => {
		sendRoomList(socket);
	})

	socket.on('getScoresList', (username) => {
		sendScores(socket, username);
	})

	socket.on('initgame', (roomname) => {
		let currRoom = rooms.get(roomname);

		if (currRoom == undefined || !currRoom.players.has(socket.id))
			socket.emit(`notauthorized:${roomname}`)
	})

	socket.on('joinRoom', ({ user: username, name: roomname }) => {

		if (!/^[a-z0-9_-]{1,16}$/.test(username) || username === undefined)
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

			if (room.owner?.socket?.id !== socket.id)
				return ;

			io.in(roomname).emit(`start:${roomname}`);
			room.launch();

		})

		socket.on(`gameMode:${roomname}`, (gameMode) => {
			let newGameMode = gameMode ?? room.gameMode

			if (room.owner?.socket?.id === socket.id)
				room.gameMode = newGameMode;
			io.in(roomname).emit(`gameMode:${roomname}`, room.gameMode);
		})

		// Disconnects
		const removePlayer = () => {
			room.removePlayer(socket);
			if (room.players.size == 0)
			{
				room.destroy();
				rooms.delete(roomname);
				socket.removeAllListeners(`start:${roomname}`)
				socket.removeAllListeners(`gameMode:${roomname}`)
				socket.removeListener('leaveRoom', removePlayer)
				socket.removeListener('disconnect', removePlayer)
			}
			sendRoomList(io);
		}
		socket.on('leaveRoom', removePlayer);
		socket.on('disconnect', removePlayer);

	})

});

io.listen(4000);