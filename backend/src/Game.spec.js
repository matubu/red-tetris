import { Game } from "./Game.js"
import { Client } from "./Client.js";

const username = "usertest";
const roomname = "roomtest";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let fakeio = () => ({
	id: Math.random(),
	emit: (...args) => {
		// console.log('emit', ...args);
	},
	join: (channel) => {
		// console.log('join', channel);
	},
	leave: () => {},
	on: (ev, func) => {
		if (ev === `event:${roomname}` || ev === 'initgame')
			func();
	},
	in: (channel) => ({
		emit: (...args) => {
			// console.log('in', channel, 'emit', ...args)
		}
	}),
	removeListener: () => {},
	removeAllListeners: () => {}
})

test('test socket io', async () => {
	let game = new Game(fakeio(), roomname, 'earth');

	game.sequence.sequence = [0, 1, 2];

	let client = new Client(fakeio());

	game.addPlayer(username, false, client);
	game.launch();

	console.log(game.players);
	[...game.players.values()][0].applyEvent('Space');

	await sleep(2000);
	
	game.stopInterval();

	game.removePlayer(client)

});

test('fake game', () => {
	let game = new Game(fakeio(), roomname, 'earth');

	let client1 = new Client(fakeio());
	game.addPlayer(username + '1', false, client1);

	let client2 = new Client(fakeio());
	game.addPlayer(username + '2', false, client2);

	game.sendUsersList();

	game.owner.score = 1;
	game.owner.gameover = true;
	game.gameOverList.push(game.owner);
	game.launch();
	game.launch();
	game.stopInterval();
	
	game.makeIndestructibleLines(10, [...game.players.values()][0]);
	game.makeIndestructibleLines(0, [...game.players.values()][1]);

	game.removePlayer(game.owner.client);
	game.removePlayer(game.owner.client);
})

test('removePlayer', () => {
	let game = new Game(fakeio(), roomname, 'earth');

	let client1 = new Client(fakeio());
	game.addPlayer(username + '1', false, client1);

	let client2 = new Client(fakeio());
	game.addPlayer(username + '2', false, client2);

	game.owner.layer[0][0] = 1;
	for (let x = 0; x < 10; ++x)
		game.owner.layer[19][x] = 1;
	game.owner.sendLayerData(client1);
	game.owner.sound('wow');
	game.owner.addLinesToBoard(10);
	game.owner.newTetriminos();
	game.owner.newTetriminos();

	game.removePlayer([...game.players.values()][1].client);
	game.removePlayer(game.owner.client);
})