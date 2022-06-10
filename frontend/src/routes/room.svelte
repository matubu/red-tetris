<script>
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { user, socket } from "$lib/user.js";
	import { browser } from "$app/env"

	let roomname = ''
	let users = []
	onMount(() => {
		if (!(roomname = location.hash.slice(1).toLowerCase()))
			goto('/rooms')
		if (browser) {
			const joinRoom = () => {
				socket.emit('joinRoom', { name: roomname, user: $user });
				socket.on(`join:${roomname}`, (_users) => {
					users = _users
					console.log("list", users);
				})
				socket.on(`start:${roomname}`, () => {
					goto(`/game#${roomname}`)
				})
			}

			socket.on('connect', joinRoom)
			joinRoom()
		}
	})
</script>

<main class="main">
	<div id="logo" on:click={() => {
		socket.emit('leaveRoom')
		goto(`/`)
	}}>
		<img width="340" alt="logo" src="/red-tetris-3d.png">
	</div>
	<div class="card">
		<h1>{roomname}</h1>
		{#each users as user}
			<p>{user}</p>
		{/each}
		<div class="action">
			<button
				class="red-button"
				on:click={() => {
					socket.emit('leaveRoom')
					goto(`/rooms`)
				}}
			>LEAVE</button>
			<button
				class="red-button"
				on:click={() => socket.emit(`start:${roomname}`)}
			>START</button>
		</div>
	</div>
</main>
