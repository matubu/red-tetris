import { writable } from "svelte/store";
import { browser } from "$app/env";
import { io } from "socket.io-client"

export let user = writable()
export const socket = io('http://localhost:4000');

if (browser)
{
	user.set(localStorage.getItem('user'))
	user.subscribe(username => {
		localStorage.setItem('user', username)
	})
}
