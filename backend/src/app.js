import { Server } from "socket.io";
import { Game } from './Game.js';
import { scoresDB } from './mongodb.js';
import { Client } from './Client.js'

export const io = new Server({
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
	const bestScores = await scoresDB.find({}, { projection: { "_id": false } }).limit(10).sort({ score: -1 }).toArray();
	// Top 10 scores for an username
	const userScores = await scoresDB.find({ username }, { projection: { "_id": false } }).limit(10).sort({ score: -1 }).toArray();

	socket.emit('scoresList', {userScores, bestScores});
}

io.on("connection", (socket) => {

	socket.on('getRoomList', () => sendRoomList(socket));

	socket.on('getScoresList', (username) => sendScores(socket, username));

	socket.on('initgame', (roomname) => {

		let currRoom = rooms.get(roomname);

		if (currRoom == undefined || !currRoom.players.has(socket.id))
			socket.emit(`notauthorized:${roomname}`)

	});

	socket.on('joinRoom', ({ user: username, name: roomname }) => {

		if (!/^[a-z0-9_-]{1,16}$/i.test(username) || username === undefined)
		{
			socket.emit('userNameError', `username required`);
			return ;
		}
		if (!/^[a-z0-9_-]{1,16}$/i.test(roomname))
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
	
		let client = new Client(socket);

		const removePlayer = () => {
			room.removePlayer(client);
			if (room.players.size == 0)
			{
				room.stopInterval();
				rooms.delete(roomname);
			}
			sendRoomList(io);
		}

		room.addPlayer(username, client);

		sendRoomList(io);

		room.sendUsersList();

		client.on(`start:${roomname}`, () => {

			if (room.owner?.client?.id !== client.id)
				return ;

			io.in(roomname).emit(`start:${roomname}`);

			room.launch();
		});

		client.on(`restart:${roomname}`, () => {
			if (room.owner?.client?.id !== client.id)
				return ;
			io.in(roomname).emit(`restart:${roomname}`);

			for (let [_, player] of room.players)
				player.client.clearListeners();
			room.players = new Map();
			room.stopInterval();

			rooms.set(roomname, new Game(io, roomname, room.gameMode));
			room = rooms.get(roomname);

			room.addPlayer(username, client, () => {});
		});

		client.on(`gameMode:${roomname}`, (gameMode) => {
			let newGameMode = gameMode ?? room.gameMode;

			if (room.owner?.client?.id === client.id)
				room.gameMode = newGameMode;
			io.in(roomname).emit(`gameMode:${roomname}`, room.gameMode);
		})

		// Disconnects
		client.on('leaveRoom', removePlayer);
		client.on('disconnect', removePlayer);

	})

});

io.listen(4000);