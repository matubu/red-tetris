<script>
	import { user } from "$lib/user.js";
	import { goto } from "$app/navigation";
	import Input from "$lib/Input.svelte";
	import { onMount } from "svelte";

	let userinput;

	onMount(() => {
		userinput.focus();
		userinput.setValue($user);
		userinput.setError(history.state.userNameError);
	})
</script>

<main class="main">
	<a id="logo" href="/">
		<img alt="logo" src="/red-tetris-3d.png">
	</a>
	<form class="card" on:submit={e => {
		e.preventDefault() // Prevent page reload
		if (!userinput.ok()) return ;
		user.set(userinput.getValue())
		goto('/rooms')
	}}>
		<h2>username</h2>
		<Input
			bind:this={userinput}
			placeholder="Enter an username"
			verify={value => {
				if (!value.trim())
					return ('Username required')
				if (!/^[a-z0-9_-]*$/i.test(value))
					return ('Username should only contains [a-z][0-9]_-');
			}}
			maxlength="16"
		/>
		<button class="red-button">PLAY</button>
	</form>
</main>
