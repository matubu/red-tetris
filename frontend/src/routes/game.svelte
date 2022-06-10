<script>
	import { user } from "$lib/user";
	import { onMount } from "svelte";
	import { TETRIMINOS } from "$lib/Shape.js";

	let gameover = false
	let currentShape
	let i = 0
	let shapes = []

	function getBoard(shapes) {
		let board = new Array(20)
			.fill()
			.map(() => new Array(10).fill(0))
		for (let shape of shapes)
			shape.drawOn(board)
		return (board)
	}

	let board = getBoard(shapes)

	onMount(() => {
		let interval = setInterval(() => {
			if (currentShape == undefined)
			{
				let newShape = TETRIMINOS[i++ % TETRIMINOS.length]
					.constructShape()
				if (newShape.intersect(getBoard(shapes)))
				{
					gameover = true
					clearInterval(interval)
					return ;
				}
				currentShape = newShape
			}

			let layer = getBoard(shapes)
			let moved = currentShape.tick(layer)
			board = currentShape.drawOn(layer)

			if (!moved)
			{
				shapes.push(currentShape)
				currentShape = undefined
			}
		}, 1000)

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
		transition: .2s;
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
	/* .red-button {
		animation .6s .8s fade 
	} */
</style>

<svelte:window
	on:keydown={e => {
		if (currentShape === undefined) return ;
		if (e.key == 'ArrowLeft')
			currentShape.move(getBoard(shapes), -1, 0)
		else if (e.key == 'ArrowRight')
			currentShape.move(getBoard(shapes), 1, 0)
		else if (e.key == 'ArrowUp')
			currentShape.rotateLeft(getBoard(shapes))
		else if (e.key == 'ArrowDown' || e.key == ' ')
			for (let i = 0; i < 5; ++i)
				currentShape.move(getBoard(shapes), 0, 1)
		else
			return ;
		board = currentShape.drawOn(getBoard(shapes))
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
		0<br>
		LEVEL<br>
		0<br>
		LINES<br>
		0
	</aside>
</main>

{#if gameover}
	<div class="gameover">
		GAMEOVER<br>
		<div class="gameover-score">
			SCORE<br>
			0
		</div>
		<button class="red-button">
			REPLAY
		</button>
	</div>
{/if}