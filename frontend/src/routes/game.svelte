<script>
	import { user, socket } from "$lib/user";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import Listener from '$lib/Listener.svelte';

	let roomname = ''
	// let usersBoard = map('socket.id', 'board');
	let gameover = false

	let board = new Array(20)
			.fill()
			.map(() => new Array(10).fill(0))

	let score = 0;
	let level = 0;
	let lines = 0;

	function initGame() {
		console.log('initgame', roomname)
		socket.emit('initgame', roomname)
	}

	onMount(() => {
		if (!(roomname = location.hash.slice(1).toLowerCase()))
			goto('/rooms')

		console.log(`emit game: initgame`)

		initGame()

		return () => {
			socket.emit('leaveRoom')
		}
	})
</script>

<style>
	main {
		width: 100%;
		height: 100%;
		background: #0c0c11;
		padding: 20px;
		display: flex;
		gap: 20px;
		justify-content: center;
	}
	.container {
		width: min(90vw, 90vh / 2);
		position: relative;
		height: fit-content;
	}
	.board {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 4px;
		overflow: hidden;
		transition: .4s;
	}
	.gameover + .board {
		filter: brightness(.5) saturate(.8) blur(6px);
	}
	.row {
		display: flex;
		gap: 4px;
	}
	.cell {
		flex: 1;
		aspect-ratio: 1/1;
		border-radius: 7%;
		transition: .1s;
		background: var(--color);
		--shadow-color: #0d0d1716;
		--shadow: inset 0 0 0 5px var(--shadow-color), inset -5px -5px var(--shadow-color);
		box-shadow: var(--shadow), 0 0 6px var(--color);
	}
	.cell-0 { --color: #3f3f3f; }
	.cell-1 { --color: #8fcdee; }
	.cell-2 { --color: #5555ef; }
	.cell-3 { --color: #e58e36; }
	.cell-4 { --color: #ebe648; }
	.cell-5 { --color: #73e852; }
	.cell-6 { --color: #dc60ea; }
	.cell-7 { --color: #ef4a58; }
	.cell-8 { --color: #929393ae; }
	.cell-0, .cell-8 {
		--shadow-color: #0d0d171e;
		box-shadow: var(--shadow); 
	}

	@keyframes popin {
		0% { transform: scale(0) }
	}
	.gameover {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: grid;
		place-content: center;
		gap: 20px;
		z-index: 999;
		animation: .5s popin forwards;
	}
	@keyframes grow {
		to {
			height: 2.5em;
			opacity: 1;
		}
	}
	.gameover-score {
		overflow: hidden;
		height: 0;
		opacity: 0;
		animation: .3s .5s grow ease-out forwards;
	}
	@keyframes fade {
		to {
			opacity: 1;
		}
	}
	aside {
		display: flex;
		flex-direction: column;
		gap: 30px;
	}
</style>

<svelte:window
	on:keydown={e => socket.emit(`event:${roomname}`, e.key)}
/>

<Listener
	on="notauthorized:{roomname}"
	handler={() => {
		console.log('notauthorized');
		goto('/rooms')
	}}
/>
<Listener
	on="connect"
	handler={initGame}
/>
<Listener
	on="gameInfo:{roomname}"
	handler={(data) => {
		console.log(`gameInfo:${roomname}| serverClientId =`, data.clientId
		,'& frontClientId =', socket.id);
		if (data.clientId === socket.id)
		{
			if (data.gameover)
				gameover = true
			else
				board = data.board;
		}
		else {

		}
	}}
/>

<main>
	<div class="container">
		{#if gameover}
			<div class="gameover">
				<h2>GAMEOVER</h2>
				<div class="gameover-score">
					SCORE<br>
					{score}
				</div>
			</div>
		{/if}

		<div class="board">
			{#each board as row}
				<div class="row">
					{#each row as cell}
						<div class="cell cell-{cell}"></div>
					{/each}
				</div>
			{/each}
		</div>
	</div>
	<aside>
		<h1>{roomname}</h1>
		<h2>{$user}</h2>
		<div>
			HIGH SCORE<br>
			0<br>
			SCORE<br>
			{score}<br>
			LEVEL<br>
			{level}<br>
			LINES<br>
			{lines}<br>
		</div>

		<button
			class="red-button"
			on:click={() => goto(`/rooms`)}
		>LEAVE</button>
	</aside>
</main>