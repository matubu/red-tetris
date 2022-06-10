<script>
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { user, socket } from "$lib/user.js";
	import { browser } from "$app/env"

	let roomname = ''
	let users = []

	let gameMode = 'earth'

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

			socket.on(`gameMode:${roomname}`, (_gameMode) => {
				gameMode = _gameMode
			})
		}
	})

	$: socket.emit(`gameMode:${roomname}`)
</script>

<style>
	input[type=radio] {
		display: none;
	}
	[name="gameMode"] + .red-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: .1em;
		width: 1em;
	}
	.red-button img {
		width: 100%;
	}
	input[type=radio]:not(:checked) + .red-button {
		--back-1: var(--grey-back-1);
		--border-1: var(--grey-border-1);
		--shadow: var(--grey-border-0);
	}
</style>

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
		<p>- {user}</p>
		{/each}
		<div class="action">
			<input type="radio" bind:group={gameMode} name="gameMode"
				value="moon" id="moon" />
			<label class="red-button" for="moon">
				<img src="/game-mode/moon.png" alt="">
			</label>
			<input type="radio" bind:group={gameMode} name="gameMode"
				value="earth" id="earth" />
			<label class="red-button" for="earth">
				<img src="/game-mode/earth.png" alt="">
			</label>
			<input type="radio" bind:group={gameMode} name="gameMode"
				value="sun" id="sun" />
			<label class="red-button" for="sun">
				<img src="/game-mode/sun.png" alt="">
			</label>
		</div>
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
