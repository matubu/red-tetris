import { connect } from './mongodb.js'
import { Server } from "socket.io";
import { launchGame } from './game.js';

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

		// Start the game shen on room
		socket.on(`start:${room.name}`, () => {
			io.in(room.name).emit(`start:${room.name}`);
		})

		// Apply event from user
		
		// Init game for user
		socket.removeAllListeners('initgame')
		socket.on('initgame', (roomname) => {
			console.log('test authorized', room.name, roomname)
			if (roomname !== room.name)
			{
				socket.emit(`notauthorized:${roomname}`)
				console.log('notauthorized')
				return ;
			}
			
			// Launch game loop
			launchGame(io, room, socket);
			// Send event game data
			socket.on(`event:${room.name}`, (key) => {
				console.log(key);
				// if (currentShape === undefined) return ;
				// if (e.key == 'ArrowLeft')
				// 	currentShape.move(layer, -1, 0)
				// else if (e.key == 'ArrowRight')
				// 	currentShape.move(layer, 1, 0)
				// else if (e.key == 'ArrowUp')
				// 	currentShape.rotateLeft(layer)
				// else if (e.key == 'ArrowDown')
				// {
				// 	currentShape.move(layer, 0, 1)
				// 	score += 1
				// }
				// else if (e.key == ' ')
				// 	while (currentShape.move(layer, 0, 1))
				// 		score += 2;
				// else
				// 	return ;
				// board = draw(currentShape, layer);
			})
		})

		// Disconnects
		socket.on('leaveRoom', () => {
			console.log('test1');
			socket.leave(room.name)
			sendUsers()
		})
		socket.on('disconnect', () => {
			sendUsers()
		})
	})

});

io.listen(4000);