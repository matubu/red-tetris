<script>
	import { goto } from "$app/navigation";
	import Input from "$lib/Input.svelte";
	import { onMount } from "svelte";
	import Listener from "$lib/Listener.svelte"
	import { user, socket } from "$lib/user.js";

	let roominput

	let userScores = []
	let bestScores = []

	let roomList = [] // (Name , Nb Users)

	onMount(() => {
		socket.emit('getRoomList');
		socket.emit('getScoresList', $user);
		roominput.focus();
		roominput.setError(history.state.roomNameError);
	})
</script>

<style>
	.room-list-title {
		font-size: 1.5rem;
		flex: 1;
	}
	.room-card {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.room-button {
		font-size: 1rem;
		padding: 10px;
	}
	.room-number {
		font-size: 1.3rem;
	}
	.score {
		display: flex;
		justify-content: space-between;
	}

	.vflex, .hflex {
		display: flex;
		gap: 40px;
	}
	.vflex {
		flex-direction: column;
	}
	.scores {
		max-width: 350px;
	}
</style>

<Listener
	on="roomList"
	handler={(_roomList) => {
		roomList = _roomList;
	}}
/>

<Listener
	on="scoresList"
	handler={(scores) => {
		userScores = scores.userScores;
		bestScores = scores.bestScores;
	}}
/>

<main class="main">
	<a id="logo" href="/">
		<img alt="logo" src="/red-tetris-3d.png">
	</a>
	<div class="hflex">
		<div class="card scores">
			<h2>User scores</h2>
			{#if userScores.length}
				{#each userScores as score}	
					<div class="score">
						<span>{score.username}</span>
						<span>{score.score}</span>
					</div>
				{/each}
			{:else}
				<p style="text-align:center">No game yet</p>
			{/if}
		</div>
		<div class="vflex">
			<form class="card" 
				
				on:submit={e => {
					e.preventDefault()
					if (!roominput.ok()) return ;
					goto(`/room#${roominput.getValue().toLowerCase()}`)
				}}
			>
				<h2>Create / Join room</h2>
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

			<div class="card">
				<h2>Room List</h2>
				{#if roomList.length}
					{#each roomList as room}
						<div class="room-card">
							<p class="room-list-title">{room.name}</p>
							<p class="room-number">{room.nbPlayer}</p>
							<button class="red-button room-button" on:click={goto(`/room#${room.name}`)}>
								join
							</button>
						</div>
					{/each}
				{:else}
					<p>Currently no room available</p>
				{/if}
			</div>
		</div>
		<div class="card scores">
			<h2>Bests scores</h2>
			{#if bestScores.length}
				{#each bestScores as score}	
					<div class="score">
						<span>{score.username}</span>
						<span>{score.score}</span>
					</div>
				{/each}
			{:else}
				<p style="text-align:center">No game yet</p>
			{/if}
		</div>
	</div>
</main>
