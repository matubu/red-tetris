import { Sequence } from "./Sequence.js";
import { Player } from "./Player.js";
import { scoresDB } from './mongodb.js'

export class Game {
	constructor(io, name, gameMode) {
		this.io = io;
		this.name = name;
		this.gameMode = gameMode;
		this.sequence = new Sequence();
		this.started = false;
		this.players = new Map() // Array of Player
		this.owner = undefined;
		this.gameOverList = [];
	}

	sendUsersList() {
		let users = this.getPlayerList()
			.map(player => player.username
				+ (player.socket.id === this.owner?.socket?.id ? ' (owner)' : ''));
		this.io.in(this.name).emit(`join:${this.name}`, users);
	}

	setOwner(owner) {
		this.owner = owner;
		owner?.socket?.emit?.(`owner:${this.name}`);
		console.log(`owner:${this.owner?.username}`, this.players);
	}

	addPlayer(username, socket) {
		if (this.players.has(socket.id))
			return ;

		let newPlayer = new Player(this.io, username, socket, this);

		if (this.players.size == 0 && this.owner === undefined)
			this.setOwner(newPlayer);
		
		socket.join(this.name);

		this.players.set(socket.id, newPlayer)
	}

	getPlayerList() {
		return [...this.players.values()]
	}

	removePlayer(socket) {
		socket.leave(this.name)
		const currPlayer = this.players.get(socket.id);
		this.players.delete(socket.id)

		if (this?.owner?.socket?.id === socket.id)
			this.setOwner([...this.players.values()][0]);

		if (this.started && currPlayer?.score > 0) {
			scoresDB.insertOne({
				username: currPlayer.username,
				score: currPlayer.score
			})
		}
		this.sendUsersList()
	}

	destroy() {
		clearInterval(this.interval);
	}

	handleEndGame() {
		let nbPlayer = this.players.size;
		let nbGameover = 0;
		for (let [_, player] of this.players)
			nbGameover += player.gameover ? 1 : 0;
		
		console.log('nbGameover->', nbGameover, 'nbPlayer->', nbPlayer);
		if (nbGameover >= nbPlayer - 1) {

			let list = [];
			this.gameOverList.forEach((val) => {
				console.log({username: val.username, score: val.score})
				list.unshift({username: val.username, score: val.score});
			});
			this.players.forEach((val) => {
				if (!val.gameover)
					list.unshift({username: val.username, score: val.score})
			});
			// Send info to know who is the owner when game is ended
			this.owner?.socket?.emit?.(`owner:${this.name}`);
			// Send endgame signal to everyone in the room
			this.io.in(this.name).emit(`endgame:${this.name}`, list);
			// Stop the setInterval of the game and delete the listeners 'event'
			this.destroy();
			for (let [_, player] of this.players) {
				player.socket.removeAllListeners(`event:${this.name}`);
			}
		}
	}

	launch() {
		this.started = true;
		this.isSolo = this.players.size === 1;

		for (let [i, player] of this.players)
		{
			player.socket.on(`event:${this.name}`, (key) => {
				player.applyEvent(key)
			})

			const sendLayerData = () => {
				for (let [j, other] of this.players)
					if (i != j)
						other.sendLayerData(player.socket)
			}
			player.socket.once('initgame', sendLayerData);

			const leaveRoom = () => {
				player.socket.removeAllListeners(`event:${this.name}`)
				player.socket.removeListener(`leaveRoom`, leaveRoom)
				player.socket.removeListener(`disconnect`, leaveRoom)
				player.socket.removeListener(`initgame`, sendLayerData)
			}

			player.socket.on('leaveRoom', leaveRoom)
			player.socket.on('disconnect', leaveRoom)
		}

		this.interval = setInterval(() => {
			// Handle end game when the game is not solo
			if (!this.isSolo)
				this.handleEndGame();
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