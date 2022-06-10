<script>
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { user, socket } from "$lib/user.js";
	import {browser} from "$app/env"

	let roomname = ''
	onMount(() => {
		function gethash() {
			if (!(roomname = location.hash.slice(1)))
				goto('/rooms')
			if (browser) {
				socket.emit('joinRoom', {room: roomname,user: $user});
				socket.on('roomMessage', (arg) => {
					console.log("on.roomMessage ->", arg);
				})
			}
		}
		window.addEventListener('hashchange', gethash);
		gethash()
		
		
		return () => window.removeEventListener('hashchange', gethash);
	})
</script>

<main class="main">
	<a href="/">
		<img width="340" alt="logo" src="/red-tetris-3d.png">
	</a>
	<div class="card">
		<h1>{roomname}</h1>
		<div class="action">
			<button
				class="red-button"
				on:click={() => goto(`/rooms`)}
			>LEAVE</button>
			<button
				class="red-button"
				on:click={() => goto(`/game#${roomname}`)}
			>START</button>
		</div>
	</div>
</main>
