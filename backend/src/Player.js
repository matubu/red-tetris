export class Player {
	constructor(_socket/*, _game*/) {
		this.username = _socket.username;
		this.socket = _socket;
		// this.game = _game;
		this.board = undefined;
	}
}