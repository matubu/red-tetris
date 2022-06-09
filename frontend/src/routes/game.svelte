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

			console.log('update', moved)
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
	.container {
		width: min(100vw, 100vh / 2);
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
	}
	.cell-0 { background: #3f3f3f; }
	.cell-1 { background: #8fcdee; }
	.cell-2 { background: #5555ef; }
	.cell-3 { background: #e58e36; }
	.cell-4 { background: #ebe648; }
	.cell-5 { background: #73e852; }
	.cell-6 { background: #dc60ea; }
	.cell-7 { background: #ef4a58; }
</style>

<svelte:window
	on:keydown={e => {
		console.log(e.key)
		if (e.key == 'ArrowLeft')
			currentShape.rotateLeft()
		else if (e.key == 'ArrowRight')
			currentShape.rotateLeft()
		else if (e.key == 'a')
			currentShape.move(getBoard(shapes), -1, 0)
		else if (e.key == 'd')
			currentShape.move(getBoard(shapes), 1, 0)
		else if (e.key == 'ArrowDown' || e.key == ' ')
			currentShape.move(getBoard(shapes), 0, 5);
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