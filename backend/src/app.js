import { connect } from './mongodb.js'

// Socket.io
import { Server } from "socket.io";

// import { gameRoom } from "./gameRoom.js"

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
		socket.username = room.user;
		
		socket.join(room.name);

		const sendUsers = () => {
			let users = [...(io.sockets.adapter.rooms?.get?.(room.name) ?? [])]
					.map(id => io.sockets.sockets.get(id).username)

			io.in(room.name).emit(`join:${room.name}`, users);
		}

		sendUsers()
		socket.on(`start:${room.name}`, () => {
			io.in(room.name).emit(`start:${room.name}`);
		})
		socket.on('leaveRoom', () => {
			socket.leave(room.name)
			sendUsers()
		})
		socket.on('disconnect', () => {
			sendUsers()
		})
	})

});

io.listen(4000);