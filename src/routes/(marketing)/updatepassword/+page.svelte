<!-- // src/routes/signin/+page.svelte -->
<script lang="ts">
	import { enhance, applyAction } from '$app/forms';
	import { goto } from '$app/navigation';
	export let form;
	let loading;
</script>

<div class="container">
	<form
		method="post"
		use:enhance={() => {
			loading = true;
			return async ({ result }) => {
				if (result.type === 'redirect') {
					goto(result.location);
					return;
				} else {
					await applyAction(result);
				}
				loading = false;
			};
		}}
	>
		{#if form?.error}
			<span class="">{form.error}</span>
		{/if}
		<input type="password" name="password" placeholder="new password" />
		<button>Update</button>
	</form>
</div>

<style>
	.container {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	form {
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		background-color: var(--dark);
		gap: 1rem;
		border: 2px solid black;
		text-align: center;
	}
</style>
