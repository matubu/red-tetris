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
				// console.log('removeOn', old_on, '->', handler)
				socket.removeListener(old_on, handler);
				old_on = new_on
				// console.log('addOn', old_on, '->', handler)
				socket.on(old_on, handler)
			})

			return () => {
				// console.log('removeOn', on, '->', handler)
				socket.removeListener(old_on, handler);
			}
		})
	}
</script>