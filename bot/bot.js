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

	start_bot(roomname, bot_count, iter) {
		return new Promise((resolve) => {
			this.room = new Room(this, roomname)

			this.room.on(`endgame:${roomname}`, (data) => {
				let tetrisCount = this.room.tetrisCount;
				this.room.leave();
				this.room = undefined;
				for (let i in data)
				{
					if (data[i].username === this.botname)
					{
						resolve({
							i: +i,
							score: data[i].score,
							tetrisCount,
							// height
							genes: this.genes,
							botname: this.botname
						});
					}
				}
			})

			this.room.on(`owner:${roomname}`, () => {
				console.log('set owner to', this.botname);
				this.room.on(`join:${roomname}`, (users) => {
					if (users.length >= bot_count)
					{
						console.log('launching iteration', iter, '...');
						this.socket.emit(`start:${roomname}`);
					}
				})
			})

			this.room.join();

		})
	}
}