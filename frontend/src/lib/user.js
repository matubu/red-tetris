import { writable } from "svelte/store";
import { browser } from "$app/env";

export let user = writable()

if (browser)
{
	user.set(localStorage.getItem('user'))
	user.subscribe(username => localStorage.setItem('user', username))
}