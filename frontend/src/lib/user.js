import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { io } from "socket.io-client";

export let user = writable();
export let connected = writable(true);
export let socket;
export let muted = writable(false);

function writableLocalStorage(writable, key) {
	let value = localStorage.getItem(key)
	if (value)
		writable.set(value)

	writable.subscribe(value => {
		if (value === undefined || value === '')
			return ;
		localStorage.setItem(key, value)
	});
}

if (browser)
{
	writableLocalStorage(user, 'user');
	writableLocalStorage(muted, 'muted');

	socket = io('/')
	socket.on("connect", () => connected.set(true))
	socket.on("connect_error", () => connected.set(false));
	socket.on("disconnect", () => connected.set(false));
}
