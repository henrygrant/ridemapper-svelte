<script lang="ts">
	import '../styles.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<div class="app">
	<main>
		<slot />
	</main>

	<nav>
		<a href="/browse" class="navitem"><div>Browse</div></a>
		<a href="/dashboard" class="navitem"><div>Dashboard</div></a>
		<a href="/map" class="navitem"><div>Map</div></a>
	</nav>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: var(--dark);
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
		overflow-y: auto;
	}

	nav {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		grid-template-rows: 50px;
		gap: 1px;
		background-color: var(--darker);
		-webkit-box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.5);
		-moz-box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.5);
		box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.5);
		z-index: 2;
	}

	.navitem {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--light);
		color: var(--darker);
		border-top: 1px solid var(--darker);
		text-decoration: none;
		font-size: 1.5rem;
	}
	.navitem:hover {
		background-color: var(--dark);
		cursor: pointer;
	}
</style>
