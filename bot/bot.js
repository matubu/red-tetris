import { Genes } from "./Genes.js";
import { io } from "socket.io-client";
import { Room } from "./Room.js";

export class Bot {
	constructor(botname) {
		/** @type {import('socket.io-client').Socket} socket */
		this.socket = io(`http://localhost:4000`);

		this.botname = botname;
		this.genes = new Genes();

		this.room = undefined;

		this.socket.on("connect_error", () => console.log(botname, 'cannot connect'));
		this.socket.on("disconnect", () => console.log(botname, 'disconnected'));
	}

	setGenes(genes) {
		this.genes = genes;
	}

	start_bot() {
		return new Promise((resolve) => {
			this.socket.on('roomList', (rooms) => {
	
				if (this.room)
					return ;
	
				let roomname = rooms[0]?.name;
	
				if (roomname === undefined)
					return ;
	
				this.room = new Room(this, roomname)
				this.room.join();

				this.room.onleave = () => {
					setTimeout(() => {
						this.room = undefined;
						this.socket.emit('getRoomList');
					}, 500)
				};

				this.room.on(`endgame:${roomname}`, (data) => {
					this.room.leave();
					this.socket.removeAllListeners('roomList');
					for (let i in data)
					{
						if (data[i].username === this.botname)
						{
							console.log('resolve', this.botname, i);
							resolve({
								i: +i,
								score: data[i].score,
								// height: getHeight(this.room.board),
								genes: this.genes
							});
						}
					}
				})
	
				this.room.on(`restart:${roomname}`, () => this.room.leave());
				this.room.on(`owner:${roomname}`, () => this.room.leave())
	
			})
		
			this.socket.emit('getRoomList');
		})
	}
}