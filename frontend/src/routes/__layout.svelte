<script>
	import { user, connected } from '$lib/user.js'
	import { goto, afterNavigate } from "$app/navigation";
	import { browser } from "$app/env";
	import '$lib/style.css'

	if (browser)
	{
		function checkPage() {
			if (location.pathname === '/')
				return ;
			if ($user === undefined || $user === '')
				goto('/');
		}

		afterNavigate(checkPage)
		user.subscribe(checkPage)
	}
</script>

<style>
	.disconnected {
		position: fixed;
		width: 100%;
		bottom: 0;
		left: 0;
		background: var(--back-1);
		color: var(--text);
		text-align: center;
	}
</style>

<slot />
{#if !$connected}
	<div class="disconnected">
		DISCONNECTED
	</div>
{/if}