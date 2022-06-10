import { connect } from './mongodb.js'

// Socket.io
import { Server } from "socket.io";

import { gameRoom } from "./gameRoom.js"

let db = await connect()
// let rooms = new Map();

const io = new Server({
	cors: {
    	origin: "*",
    	methods: ["GET", "POST"]
	}
});

io.on("connection", (socket) => {
	
	console.log("connection socket", socket.id)
	
	socket.on('joinRoom', (room) => {
		// if (rooms.get(room) !== undefined)
		// 	rooms.set(room, new gameRoom(room))
		// let currRoom = rooms.get(room);
		// currRoom.sockets.push(socket);
		console.log(room);
		socket.join(room.room);
		socket.in(room.room).emit('roomMessage', "a client joined the room", room);
	})
});



io.listen(4000);