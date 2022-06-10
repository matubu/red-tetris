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
	<a href="/">
		<img width="340" alt="logo" src="/red-tetris-3d.png">
	</a>
	<div class="card">
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
		<div class="action">
			<button
				class="red-button"
				on:click={e => {
					if (!roominput.ok()) return ;
					goto(`/room#${roominput.getValue()}`)
				}}
			>CREATE</button>
			<button
				class="red-button"
				on:click={e => {
					if (!roominput.ok()) return ;
					goto(`/room#${roominput.getValue()}`)
				}}
			>JOIN</button>
		</div>
	</div>
</main>
