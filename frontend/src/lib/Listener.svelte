<script>
	import { onMount } from "svelte";
	import { socket } from "$lib/user.js";
	import { browser } from "$app/env";
	import { writable } from "svelte/store";

	/** @type string */
	export let on;
	/** @type Function */
	export let handler;

	let old_on

	let w_on = writable()
	$: w_on.set(on)

	if (browser) {
		onMount(() => {
			w_on.subscribe(new_on => {
				socket.removeListener(old_on, handler);
				old_on = new_on
				socket.on(old_on, handler)
			})

			return () => {
				socket.removeListener(old_on, handler);
			}
		})
	}
</script>