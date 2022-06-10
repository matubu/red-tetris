<script>
	export let verify
	export let placeholder
	export let maxlength

	let input
	let error
	let value = ''

	export function ok() {
		error = verify(getValue())
		if (error === undefined)
			return (true);
		input.animate([
			{ transform: 'translateX(0px)' },
			{ transform: 'translateX(4px)' },
			{ transform: 'translateX(-4px)' },
			{ transform: 'translateX(2px)' },
			{ transform: 'translateX(-2px)' },
			{ transform: 'translateX(0px)' },
		], { duration: 400 })
		return (false)
	}
	export function getValue() {
		return (value)
	}
	export function setValue(_value) {
		value = _value
	}
	export function focus() {
		input.focus()
	}
</script>

<div>
	{#if error}
		<div class="error">{error}</div>
	{/if}
	<input
		bind:this={input}
		on:input={async (e) => {
			error = verify(e.target.value)
		}}
		bind:value={value}
		class="red-input"
		{placeholder}
		{maxlength}
	>
</div>