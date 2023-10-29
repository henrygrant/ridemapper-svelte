<script lang="ts">
	import '../styles.css';
	import Loader from '$lib/components/Loader.svelte';
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

{#await data.streamed.bigUpdatePromise}
	<div class="messageContainer"><Loader /></div>
{:then}
	<div class="app">
		<main>
			<slot />
		</main>

		<nav>
			<a href="/browse" class="navitem"><div>Browse</div></a>
			<a href="/dashboard" class="navitem"><div>Dashboard</div></a>
			<a href="/map" class="navitem" data-sveltekit-reload><div>Map</div></a>
		</nav>
	</div>
{:catch error}
	<div class="messageContainer">Error {error.message}</div>
{/await}

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: var(--dark);
	}

	.messageContainer {
		display: flex;
		height: 100%;
		background-color: var(--dark);
		justify-content: center;
		align-items: center;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		overflow-y: auto;
	}

	nav {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		grid-template-rows: 50px;
		gap: 2px;
		background-color: black;
		-webkit-box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.5);
		-moz-box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.5);
		box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.5);
		z-index: 2;
		letter-spacing: 0.08rem;
	}

	.navitem {
		font-family: Impact, 'Anton', Haettenschweiler, 'Arial Narrow Bold', sans-serif;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--light);
		color: var(--darker);
		border-top: 2px solid black;
		text-decoration: none;
		font-size: 2rem;
	}
	.navitem:hover {
		background-color: var(--dark);
		cursor: pointer;
	}

	@keyframes rotation {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
