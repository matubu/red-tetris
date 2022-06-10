<script>
	import { user } from "$lib/user";
	import { onMount } from "svelte";
	import { TETRIMINOS } from "$lib/Shape.js";

	let gameover = false
	let currentShape
	let i = 0
	let layer = emptyBoard()
	let board = emptyBoard()

	let score = 0;
	let level = 0;
	let lines = 0;

	function emptyBoard() {
		let board = new Array(20)
			.fill()
			.map(() => new Array(10).fill(0))
		return (board)
	}

	function makeShadow(currentShape) {
		let copy = currentShape.clone()
		copy.colorid = 8
		while (copy.tick(layer)) ;
		return copy;
	}
	function draw(currentShape, layer) {
		let board;
		let shadow = makeShadow(currentShape);
		
		board = shadow.drawOn(layer)
		board = currentShape.drawOn(board)
		return board
	}

	onMount(() => {
		let interval = setInterval(() => {
			if (currentShape == undefined)
			{
				let newShape = TETRIMINOS[i++ % TETRIMINOS.length]
					.constructShape()
				if (newShape.intersect(layer))
				{
					gameover = true
					clearInterval(interval)
					return ;
				}
				currentShape = newShape
			}
			
			let moved = currentShape.tick(layer)
			board = draw(currentShape, layer);

			if (!moved)
			{
				layer = currentShape.drawOn(layer)
				currentShape = undefined

				let filterLayer = layer
					.filter(row => row.some(cell => cell == 0));
				score += [0, 100, 300, 500, 800][layer.length - filterLayer.length]
				while (filterLayer.length != layer.length)
				{
					filterLayer.unshift(new Array(10).fill(0))
					++lines;
				}
				layer = filterLayer
			}
		}, 250)

		return () => {
			clearInterval(interval)
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
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.row {
		display: flex;
		gap: 5px;
	}
	.cell {
		flex: 1;
		aspect-ratio: 1/1;
		border-radius: 3px;
		transition: .1s;
		background: var(--color);
		box-shadow: inset 0 0 25px #13122055, 0 0 6px var(--color);
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

	@keyframes popin {
		0% {
			background: #0000;
			transform: scale(0);
		}
		to {
			background: #0009;
		}
	}
	.gameover {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: grid;
		place-content: center;
		z-index: 999;
		font-size: 50px;
		animation: .5s popin forwards;
	}
	@keyframes grow {
		to {
			height: 3em;
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
	.red-button {
		opacity: 0;
		animation: .5s .7s fade forwards
	}
</style>

<svelte:window
	on:keydown={e => {
		if (currentShape === undefined) return ;
		if (e.key == 'ArrowLeft')
			currentShape.move(layer, -1, 0)
		else if (e.key == 'ArrowRight')
			currentShape.move(layer, 1, 0)
		else if (e.key == 'ArrowUp')
			currentShape.rotateLeft(layer)
		else if (e.key == 'ArrowDown')
		{
			currentShape.move(layer, 0, 1)
			score += 1
		}
		else if (e.key == ' ')
			while (currentShape.move(layer, 0, 1))
				score += 2;
		else
			return ;
		board = draw(currentShape, layer);
	}}
/>

<main>
	<div class="container">
		{#each board as row}
			<div class="row">
				{#each row as cell}
					<div class="cell cell-{cell}"></div>
				{/each}
			</div>
		{/each}
	</div>
	<aside>
		{$user}<br>
		HIGH SCORE<br>
		0<br>
		SCORE<br>
		{score}<br>
		LEVEL<br>
		{level}<br>
		LINES<br>
		{lines}
	</aside>
</main>

{#if gameover}
	<div class="gameover">
		GAMEOVER<br>
		<div class="gameover-score">
			SCORE<br>
			{score}
		</div>
		<button
			class="red-button"
			on:click={() => window.location.reload(true)
		}>
			REPLAY
		</button>
	</div>
{/if}