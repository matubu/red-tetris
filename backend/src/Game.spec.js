import { Game } from "./Game.js"
import { Client } from "./Client.js";

const id = "id32"
const username = "usertest";
const roomname = "roomtest";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

test('test socket io', async () => {
	let game = new Game({
		in: (channel) => ({
			emit: (...args) => {
				console.log('io in', channel, 'emit', ...args)
			}
		}),
	}, roomname, 'earth');

	game.sequence.sequence = [0, 1, 2];

	let client = new Client({
		id,
		emit: (...args) => {
			console.log('emit', ...args);
		},
		join: (channel) => {
			console.log('join', channel);
		},
		leave: () => {},
		on: () => {},
		in: (channel) => ({
			emit: (...args) => {
				console.log('in', channel, 'emit', ...args)
			}
		}),
		removeListener: () => {},
		removeAllListeners: () => {}
	});

	game.addPlayer(username, client);
	game.launch();

	console.log(game.players)
	game.players.get(id).applyEvent('Space');

	await sleep(2000);
	
	game.stopInterval();

	game.removePlayer(client)

});
