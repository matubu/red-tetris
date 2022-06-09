<script>
	let logoRedTetris = '';
</script>


<style>

.centered-div {
	margin: auto;
	width: 40rem;
	height: 55rem;
	justify-content: center;
	text-align: center;
	background: #383838;
	
	border-radius: 2rem;
	margin-top: 2rem;
}
.red-button {
	width: 10rem;
	height: 3rem;
	/* border-radius: 2rem; */
	border-color: transparent;
	/* background: rgb(255,131,82);
	background: linear-gradient(90deg, rgba(255,131,82,1) 0%,
										rgba(255,110,98,1) 28%,
										rgba(255,38,19,1) 60%,
										rgba(255,110,98,1) 87%,
										rgba(255,140,140,1) 100%); */
	box-shadow: var(--col) var(--pixel) 0, var(--col) 0px var(--pixel) 0px, var(--col) calc(var(--pixel) * -1) 0, var(--col) 0 calc(var(--pixel) * -1);
	background: var(--col);
	border: none;
	--pixel: 5px;
	--col: rgb(255,131,82);
}

.test-text {
	position: absolute;
	top: 20%;
	left: 50%;
	transform: translate(-50%, -50%);
	color: white;
}
</style>

<div  class="centered-div">
	<img style="position: relative; image-rendering:pixelated;" width="520" height="280" alt="" src="/red-tetris-logo-font.png">
	<!-- <div class="test-text"> TEST </div> -->
	<button type="button" class="red-button">
		Play
	</button>
</div>

