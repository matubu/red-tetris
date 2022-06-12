import { Sequence } from "./Sequence.js";
import { Player } from "./Player.js";

export class Game {
	constructor(io, name, gameMode) {
		this.io = io;
		this.name = name;
		this.gameMode = gameMode;
		this.sequence = new Sequence();
		this.started = false;
		this.players = new Map() // Array of Player
	}

	sendUsersList() {
		let users = this.getPlayerList().map(player => player.username);
		console.log(users);
		this.io.in(this.name).emit(`join:${this.name}`, users);
	}

	addPlayer(username, socket) {
		socket.join(this.name);
		this.players.set(socket.id, new Player(this.io, username, socket, this))
	}
	getPlayerList() {
		return [...this.players.values()]
	}
	removePlayer(socket) {
		console.log('removePlayer', this);
		socket.leave(this.name)
		this.players.delete(socket.id)
		this.sendUsersList()
	}

	launch() {
		this.started = true;

		for (let [_, player] of this.players)
		{
			player.socket.on(`event:${this.name}`, (key) => {
				player.applyEvent(key)
			})

			const leaveRoom = () => {
				player.socket.removeAllListeners(`event:${this.name}`)
				player.socket.removeListener(`leaveRoom`, leaveRoom)
				player.socket.removeListener(`disconnect`, leaveRoom)
			}

			player.socket.on('leaveRoom', leaveRoom)
			player.socket.on('disconnect', leaveRoom)
		}

		let interval = setInterval(() => {

			if (this.players.size == 0)
			{
				clearInterval(interval);
				this.started = false;
			}

			for (let [_, player] of this.players)
				player.tick()

		}, {
			blackhole: 75,
			sun: 150,
			earth: 400,
			moon: 800
		}[this.gameMode])
	}
}