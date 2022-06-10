<script>
	import { user } from "$lib/user.js";
	import { goto } from "$app/navigation";
	import Input from "$lib/Input.svelte";
	import { onMount } from "svelte";

	let userinput

	onMount(() => {
		userinput.setValue($user)
	})
</script>

<main class="main">
	<a href="/">
		<img width="340" alt="logo" src="/red-tetris-3d.png">
	</a>
	<form class="card" on:submit={e => {
		e.preventDefault() // Prevent page reload
		if (!userinput.ok()) return ;
		user.set(userinput.getValue())
		goto('/rooms')
	}}>
		<Input
			bind:this={userinput}
			placeholder="Enter a username"
			verify={value => {
				if (!value.trim())
					return ('Username required')
				if (!/^[a-z0-9_-]*$/.test(value))
					return ('Username should only contains [a-z][0-9]_-')
			}}
			maxlength="16"
		/>
		<button class="red-button">PLAY</button>
	</form>
</main>
