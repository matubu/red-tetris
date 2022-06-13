<script>
	import { user, socket } from "$lib/user";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import Listener from '$lib/Listener.svelte';

	let roomname = ''
	let usersBoard = new Map();
	let gameover = false;

	let board = new Array(20)
			.fill()
			.map(() => new Array(10).fill(0))

	let score = 0;
	let lines = 0;

	let owner = false;

	let nextShape = {
		shape: []
	};

	// Handle end game when playing multiplayer
	let endPlayerList = [];
	let isEndGame = false;

	function initGame() {
		socket.emit('initgame', roomname)
	}

	function endGame(playerList) {
		console.log(playerList);
		endPlayerList = playerList;
		isEndGame = true;
	}

	onMount(() => {
		if (!(roomname = location.hash.slice(1).toLowerCase()))
			goto('/rooms')

		initGame()
	})
</script>

<style>
	main {
		overflow: hidden;
		width: 100%;
		height: 100%;
		background: #0c0c11;
		padding: 20px;
		display: flex;
		gap: 20px;
		justify-content: center;
	}
	.container {
		width: 100%;
		max-width: calc(90vh / 2);
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
		filter: brightness(.5) saturate(.8);
	}
	.row {
		display: flex;
		gap: 4px;
	}
	.score-div {
		display: flex;
		justify-content: space-between;
	}
	.cell {
		flex: 1;
		aspect-ratio: 1/1;
		border-radius: 7%;
		transition: .04s;
		background: var(--color);
		--shadow-color: #0d0d1716;
		--shadow: inset 0 0 0 5px var(--shadow-color), inset -5px -5px var(--shadow-color);
		box-shadow: var(--shadow), 0 0 6px var(--color);
	}
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
	.cell-0 { --color: #3f3f3f; }

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

	.small-board {
		display: flex;
		aspect-ratio: 1/2;
		background: var(--back-1);
	}
	.small-board > div {
		background: var(--grey-back-1);
		flex: 1;
	}
	.small-gameover {
		filter: brightness(.3) saturate(.6);
	}

	.others {
		max-width: 15vw;
		overflow-y: auto;
		padding-right: 10px;
	}
	.others > div {
		width: 100%;
	}
	.self {
		max-width: 30vw;
	}
	.next-piece {
		width: 4rem;
	}

	@keyframes endgame-anim {
		0% {
			transform: translate(-50%, -50%) scale(0);
			opacity: 0;
		}
		75% {
			transform: translate(-50%, -50%) scale(1.1);
		}
		to {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
		}
	}
	.card-endgame {
		box-shadow: 0 0 50px -15px var(--grey-back-0);
		position: fixed; /* Stay in place */
		z-index: 9999; /* Place in front of other elements */
		overflow: auto; /* Enable scroll */
		top: 50%;
		left: 50%;
		animation: 0.5s endgame-anim cubic-bezier(0.42, 0, 0.21, 1.4) forwards;
	}
</style>

<svelte:window
	on:keydown={e => socket.emit(`event:${roomname}`, e.key)}
/>

<Listener
	on="notauthorized:{roomname}"
	handler={() => goto('/rooms')}
/>
<Listener
	on="owner:{roomname}"
	handler={() => {
		owner = true
	}}
/>
<Listener
	on="connect"
	handler={initGame}
/>

<Listener
	on="endgame:{roomname}"
	handler={endGame}
/>

<Listener
	on="restart:{roomname}"
	handler={() => goto(`/room#${roomname}`)}
/>

<Listener
	on="gameInfo:{roomname}"
	handler={(data) => {
		if (data.clientId === socket.id)
		{
			if (data.gameover)
				gameover = true
			else {
				board = data.board;
				score = data.scores.score;
				lines = data.scores.lines;
				nextShape = data.nextShape;
				console.log(nextShape.shape);
			}
		}
		else {
			if (data.gameover)
				usersBoard.set(data.clientId, {
					...usersBoard.get(data.clientId),
					gameover: true,
				})
			else
			{
				usersBoard.set(data.clientId, {
					username: data.username,
					heights: data.heights,
					scores: data.scores
				});
			}
			usersBoard = usersBoard
		}
	}}
/>

<main>
	<aside class="others">
		{#each [...usersBoard.entries()] as [_, { username, heights, scores, gameover }]}
			<div>
				{username}<br>
				{scores.score}
				<div class="small-board {gameover ? 'small-gameover' : ''}">
					{#each heights as height}
						<div style="height: {height / 20 * 100}%;"></div>
					{/each}
				</div>
			</div>	
		{/each}
	</aside>
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
	<aside class="self">
		<h1>{roomname}</h1>
		<h2>{$user}</h2>
		<div>
			HIGH SCORE<br>
			0<br>
			SCORE<br>
			{score}<br>
			LINES<br>
			{lines}<br>
			<br />
			<div class="board next-piece">
				{#each nextShape.shape as row}
					<div class="row">
						{#each row as cell}
							<div class="cell cell-{cell ? nextShape.colorid : 0}"></div>
						{/each}
					</div>
				{/each}
			</div>
		</div>

		{#if !isEndGame}
			<button
				class="red-button"
				on:click={() => {
					socket.emit('leaveRoom')
					goto(`/rooms`)
				}}
			>LEAVE</button>
		{/if}
	</aside>
	{#if isEndGame || (endPlayerList.length === 0 && gameover)}
		<div class="card card-endgame">
			<h2>Scores</h2>
			<div class="score-div">
				<p>Top</p>
				<p>Name</p>
				<p>score</p>
			</div>
			{#each endPlayerList as player, i}
				<div class="score-div">
					<p>{i + 1}</p>
					<p>{player.username}</p>
					<p>{player.score}</p>
				</div>
				<hr/>
			{/each}
			{#if owner}
				<button
				class="red-button"
				on:click={() => {
					socket.emit(`restart:${roomname}`);
				}}
			>RESTART</button>
			{/if}
			<button
				class="red-button"
				on:click={() => {
					socket.emit('leaveRoom')
					goto(`/rooms`)
				}}
			>LEAVE</button>
		</div>
	{/if}

</main>