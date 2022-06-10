<script>
	import { user } from "$lib/user.js";
	import { goto } from "$app/navigation";

	const playButton = e => {
		e.preventDefault() // Prevent page reload
		console.log("Clicked !");
		goto('/game')
	}
</script>


<style>
main {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 40px;
}

.logo-img {
	image-rendering: pixelated;
}
</style>

<main>
	<img class="logo-img" width="340" alt="logo" src="/red-tetris-3d.png">
	<form class="card" on:submit={playButton}>
		<input bind:value={$user} class="red-input" required placeholder="Enter an username">
		<button class="red-button">PLAY</button>
	</form>
</main>
