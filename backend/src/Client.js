export class Client {
	constructor(socket) {
		this.socket = socket
		this.listeners = []
		this.rooms = []
	}
	get id() {
		return (this.socket.id)
	}
	join(roomname) {
		this.socket.join(roomname);
		this.rooms.push(roomname);
	}
	emit(...args) {
		this.socket.emit(...args)
	}
	on(event, handler) {
		console.log('Add event listner', event, handler)
		this.socket.on(event, handler)
		this.listeners.push([event, handler])
	}
	in(roomname) {
		return (this.socket.in(roomname))
	}
	removeAllListeners(event) {
		this.socket.removeAllListeners(event)
	}
	destroy() {
		for (let [event, handler] of this.listeners)
		{
			console.log('Remove event listner', event, handler)
			this.socket.removeListener(event, handler)
		}
		for (let room of this.rooms)
			this.socket.leave(room)
	}
}