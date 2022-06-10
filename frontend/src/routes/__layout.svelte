<script>
	import { connected } from '$lib/user.js'
	import '$lib/style.css'
</script>

<style>
	.disconectted {
		position: fixed;
		width: 100%;
		bottom: 0;
		left: 0;
		background: var(--back-1);
		color: var(--text);
		text-align: center;
	}
</style>

{#if !$connected}
<div class="disconectted">
	disconectted
</div>
{/if}
<slot />