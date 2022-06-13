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
				+ (player.client.id === this.owner?.client?.id ? ' (owner)' : ''));
		this.io.in(this.name).emit(`join:${this.name}`, users);
	}

	setOwner(owner) {
		this.owner = owner;
		owner?.client?.emit?.(`owner:${this.name}`);
		console.log(`setowner ${this.owner?.username}`);
	}

	addPlayer(username, client) {
		console.log('addPlayer', username, this.owner?.username)

		let newPlayer = new Player(this.io, username, client, this);

		client.join(this.name);

		if (this.players.size == 0 || this.owner?.client.id === client.id)
			this.setOwner(newPlayer);

		this.players.get(client.id)?.clearListeners?.();
		this.players.set(client.id, newPlayer)
	}

	getPlayerList() {
		return [...this.players.values()]
	}

	removePlayer(client) {
		client.clearListeners();

		const currPlayer = this.players.get(client.id);
		
		this.players.delete(client.id)

		if (this?.owner?.client?.id === client.id)
			this.setOwner([...this.players.values()][0]);

		if (this.started && currPlayer?.score > 0)
			scoresDB.insertOne({
				username: currPlayer.username,
				score: currPlayer.score
			})

		this.sendUsersList()
	}

	removeInterval() {
		clearInterval(this.interval);
	}

	checkEndGame(isSolo) {
		let nbGameover = 0;

		for (let [_, player] of this.players)
			if (player.gameover)
				++nbGameover;

		if (nbGameover >= this.players.size - (isSolo ? 0 : 1)) {
			this.removeInterval();
			for (let [_, player] of this.players)
				player.client.removeAllListeners(`event:${this.name}`);

			let list = [];
			for (let { username, score } of this.gameOverList)
				list.unshift({ username, score });

			for (let [_, { username, score, gameover }] of this.players)
				if (!gameover)
					list.unshift({ username, score })

			console.log("=>>> gameoverlist", this.gameOverList);
			console.log("=>>> players", this.players);
			console.log("=>>> list", list);

			this.setOwner(this.owner)

			this.io.in(this.name).emit(`endgame:${this.name}`, list);
		}
	}

	launch() {
		this.started = true;
		let isSolo = (this.players.size === 1);

		for (let [i, player] of this.players)
		{
			player.client.on(`event:${this.name}`, (key) => {
				player.applyEvent(key)
			})

			const sendLayerData = () => {
				for (let [j, other] of this.players)
					if (i != j)
						other.sendLayerData(player.client)
			}
			player.client.on('initgame', sendLayerData);
		}

		this.interval = setInterval(() => {

			this.checkEndGame(isSolo);

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