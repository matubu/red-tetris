<script>
	const playButton = () => {
		console.log("Clicked !");
	}
</script>


<style>

.centered-div {
	margin: auto;
	width: 40rem;
	height: 40rem;
	justify-content: center;
	text-align: center;
	background: #383838;
	/* box-shadow: 0 0 10px 10px #f00B; */
	border-radius: 2rem;
	margin-top: 5rem;
	border: 0.5rem solid grey;
	border-bottom-color: grey;
	border-right-color: grey;
}

.red-button {
	margin-top: 2rem;
	margin-bottom: 2rem;
	border-color: transparent;
	background: #383838;
	cursor: pointer;
}

.logo-img {
	position: relative;
	image-rendering:pixelated;
	margin-top: 2rem;
	margin-bottom: 2rem;
}

.red-input {
	height: 3rem;
	font-family: 'redtetris', sans-serif;
	font-size: 60px;
	color: #FA2A2A;
	font-weight: lighter;
	border-radius: 15px;
	text-align: center;
	margin-top: 2rem;
	margin-bottom: 1rem;
	background-color: #333333;

	border: 0.5rem solid black;
	border-top-color: #555555;
	border-left-color: #555555;

	outline-color: transparent;
	text-transform: uppercase;
}
</style>

<div  class="centered-div">
	<img class="logo-img" width="520" height="280" alt="logo" src="/red-tetris-logo.png">
	<br/>
	<input type="input" class="red-input" placeholder="Enter an username">
	<br/>
	<button type="button" class="red-button" on:click={playButton}>
		<img alt="bp" src="/play-button.png">
	</button>

</div>

