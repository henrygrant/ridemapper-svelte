<!-- // src/routes/signin/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	export let form;
</script>

<div class="container">
	<form method="post" action="?/signin" use:enhance>
		<input name="email" value={form?.email ?? ''} placeholder="email" />
		<input type="password" name="password" placeholder="password" />
		<button>Sign in</button>
		<a href="/signup">Sign up instead</a>
		<button class="look-like-anchor" formaction="?/resetpassword">Reset Password</button>
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
		border: 1px solid var(--darker);
		text-align: center;
	}
</style>
