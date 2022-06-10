<script>
	import { goto } from "$app/navigation";
	import Input from "$lib/Input.svelte";
	import { onMount } from "svelte";

	let roominput

	onMount(() => {
		roominput.focus()
	})
</script>

<main class="main">
	<a id="logo" href="/">
		<img width="340" alt="logo" src="/red-tetris-3d.png">
	</a>
	<form class="card" 
		on:submit={e => {
			e.preventDefault()
			if (!roominput.ok()) return ;
			goto(`/room#${roominput.getValue()}`)
		}}
	>
		<Input
			bind:this={roominput}
			placeholder="Enter a roomname"
			verify={value => {
				if (!value)
					return ('Roomname required')
				if (!/^[a-z0-9_-]*$/i.test(value))
					return ('Roomname should only contains [a-z][0-9]_-')
			}}
			maxlength="16"
		/>
		<button class="red-button">JOIN</button>
	</form>
</main>
