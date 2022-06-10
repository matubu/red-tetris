import { writable } from "svelte/store";
import { browser } from "$app/env";
import { io } from "socket.io-client"

export let user = writable();
export let connected = writable(true);
export let socket;

if (browser)
{
	user.set(localStorage.getItem('user'))
	user.subscribe(username => localStorage.setItem('user', username))

	socket = io(`http://${location.hostname}:4000`)
	socket.on("connect", () => connected.set(true))
	socket.on("connect_error", () => connected.set(false));
	socket.on("disconnect", () => connected.set(false));
}
