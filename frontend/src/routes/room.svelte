<script>
	import { goto } from "$app/navigation";
    import { page } from '$app/stores'

	let roomname = ''
	$: roomname = $page.url.hash.slice(1)
</script>

<main class="main">
	<a href="/">
		<img width="340" alt="logo" src="/red-tetris-3d.png">
	</a>
	<div class="card">
		<h1>{roomname}</h1>
		<div class="action">
			<button
				class="red-button"
				on:click={() => goto(`/rooms`)}
			>LEAVE</button>
			<button
				class="red-button"
				on:click={() => goto(`/game#${roomname}`)}
			>START</button>
		</div>
	</div>
</main>
