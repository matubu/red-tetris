import { emptyBoard, Player } from './Player.js'
import { io as ClientSocket } from "socket.io-client";
import { Client } from "./Client.js";
import { Game } from "./Game.js";


test("emptyBoard", async () => {
	// const socket = await ClientSocket(`http://localhost:4000`);

	// const room = new Game(io, 'roomname', 'earth');

	// let player = new Player(io, 'username', new Client(socket), room);

	// player.gameover = true;

	// expect(player.tick()).toBe(false);
	makeShadow(currentShape, layer)
	expect(emptyBoard().length).toBe(20);
	expect(emptyBoard()[0].length).toBe(10);
	expect(emptyBoard()[0][0]).toBe(0);
	expect(emptyBoard()[19][9]).toBe(0);
});