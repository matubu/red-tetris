<script>
	import { goto } from "$app/navigation";
	import Input from "$lib/Input.svelte";
	import { onMount } from "svelte";
	import Listener from "$lib/Listener.svelte"
	import { socket } from "$lib/user.js";

	let roominput

	let roomList = [] // (Name , Nb Users)

	onMount(() => {
		socket.emit('getRoomList');
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
	.title-card {
		font-size: 1.9rem;
		text-align: center;
	}
</style>

<Listener
	on="roomList"
	handler={(_roomList) => {
		roomList = _roomList;
		console.log('roomList = ', roomList);
	}}
/>

<main class="main">
	<a id="logo" href="/">
		<img alt="logo" src="/red-tetris-3d.png">
	</a>
	<form class="card" 
		
		on:submit={e => {
			e.preventDefault()
			if (!roominput.ok()) return ;
			goto(`/room#${roominput.getValue().toLowerCase()}`)
		}}
	>
		<p class="title-card">Create / Join room</p>
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
		<p class="title-card">Room List</p>
		{#if roomList.length}
			<!-- <div class="room-card">
				<p class="text-card">name:</p>
				<p class="text-card">number:</p>
			</div> -->
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
			<p style="text-align:center;">Currently no room available</p>
		{/if}
	</div>
</main>
