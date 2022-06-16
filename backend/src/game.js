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
		this.players = new Map(); // Array of Player
		this.owner = undefined;
		this.gameOverList = [];

		this.tick_per_secs = 0;
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
	}

	addPlayer(username, client) {

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
		
		this.players.delete(client.id);

		if (this?.owner?.client?.id === client.id)
			this.setOwner([...this.players.values()][0]);

		if (this.started && currPlayer?.score > 0)
			scoresDB.insertOne({
				username: currPlayer.username,
				score: currPlayer.score
			})

		this.sendUsersList();

	}

	stopInterval() {
		this.tick_per_secs = 0;
		clearTimeout(this.timeout);
	}

	makeIndestructibleLines(nbLines, senderPlayer) {
		if (nbLines <= 0)
			return ;
		for (let [_, player] of this.players) {
			if (senderPlayer.client.id !== player.client.id) {
				player.addIndestructibleLine(nbLines);
			}
		}
	}

	checkEndGame(isSolo) {
		let nbGameover = 0;

		for (let [_, player] of this.players)
			if (player.gameover)
				++nbGameover;

		if (nbGameover >= this.players.size - (isSolo ? 0 : 1)) {
			this.stopInterval();
			for (let [_, player] of this.players)
				player.client.removeAllListeners(`event:${this.name}`);

			let list = [];
			for (let { username, score } of this.gameOverList)
				list.unshift({ username, score });

			for (let [_, { username, score, gameover }] of this.players)
				if (!gameover)
					list.unshift({ username, score });

			this.setOwner(this.owner);

			this.io.in(this.name).emit(`endgame:${this.name}`, list);
		}
	}

	launch() {
		if (this.started)
			return ;

		this.started = true;
		let isSolo = (this.players.size === 1);

		for (let [i, player] of this.players)
		{
			player.client.on(`event:${this.name}`, (key) => {
				player.applyEvent(key);
			});

			player.client.on('initgame', () => {
				for (let [j, other] of this.players)
					if (i != j)
						other.sendLayerData(player.client);
			});
		}

		this.tick_per_secs = {
			blackhole: 13,
			sun: 6,
			earth: 2.5,
			moon: 1.25
		}[this.gameMode];

		const loop = () => {

			this.checkEndGame(isSolo);

			for (let [_, player] of this.players)
				player.tick();

			if (this.tick_per_secs > 0)
			{
				this.timeout = setTimeout(loop, 1000 / this.tick_per_secs);
				this.tick_per_secs += 0.002;
			}

		}
		loop();
	}
}