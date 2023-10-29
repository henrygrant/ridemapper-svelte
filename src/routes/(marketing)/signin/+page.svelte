<!-- // src/routes/signin/+page.svelte -->
<script lang="ts">
	import { enhance, applyAction } from '$app/forms';
	import { goto } from '$app/navigation';
	import Loader from '$lib/components/Loader.svelte';
	import type { ActionData } from './$types';
	export let form: ActionData;
	let loading;
</script>

<div class="container">
	{#if loading}
		<Loader />
	{:else}
		<form
			method="post"
			action="?/signin"
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
			<input name="email" value={form?.email ?? ''} placeholder="email" />
			<input type="password" name="password" placeholder="password" />
			<button>Sign in</button>
			<a href="/signup">Sign up instead</a>
			<button class="look-like-anchor" formaction="?/resetpassword">Reset password</button>
		</form>
	{/if}
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

	a {
		font-weight: bold;
	}
</style>
