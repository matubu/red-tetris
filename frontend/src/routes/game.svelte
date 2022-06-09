<script>
	import { onMount } from "svelte"
	import { TETRIMINOS } from "$lib/Shape.js"

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
				currentShape = TETRIMINOS[i++ % TETRIMINOS.length]
					.constructShape()

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
	:global(html) {
		background: #0c0c11;
	}
	.container {
		width: min(90vw, 90vh / 2);
		display: flex;
		flex-direction: column;
		gap: 5px;
		margin: 0 auto;
	}
	.row {
		display: flex;
		gap: 5px;
	}
	.cell {
		flex: 1;
		aspect-ratio: 1/1;
		border-radius: 4px;
		transition: .2s;
		background: var(--color);
		box-shadow: inset 0 0 18px #13122088, 0 0 10px var(--color);
	}
	.cell-0 { --color: #3f3f3f; }
	.cell-1 { --color: #8fcdee; }
	.cell-2 { --color: #5555ef; }
	.cell-3 { --color: #e58e36; }
	.cell-4 { --color: #ebe648; }
	.cell-5 { --color: #73e852; }
	.cell-6 { --color: #dc60ea; }
	.cell-7 { --color: #ef4a58; }
</style>

<svelte:window
	on:keydown={e => {
		console.log(e.key)
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

<div class="container">
	{#each board as row}
		<div class="row">
			{#each row as cell}
				<div class="cell cell-{cell}"></div>
			{/each}
		</div>
	{/each}
</div>