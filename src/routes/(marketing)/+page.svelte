<script>
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<div class="wrapper">
		<span data-text="Ride" />
		<span data-text="Mapper" />
	</div>
	<div class="auth">
		<a href="/signin"><button>Sign in</button></a>
		<a href="/signup"><button>Sign up</button></a>
	</div>
</section>

<style>
	section {
		height: 100vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.wrapper {
		font-size: 20vmin;
		height: 2em;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		mix-blend-mode: screen;
	}

	.wrapper span {
		--color: var(--dark);
		font-family: Impact, 'Anton', Haettenschweiler, 'Arial Narrow Bold', sans-serif;
		font-weight: 700;
		font-style: italic;
		display: block;
		position: absolute;
		color: var(--color);
		letter-spacing: -0.005em;
	}
	.wrapper span::before,
	.wrapper span::after {
		content: attr(data-text);
		display: block;
		position: relative;
		padding: 0 0.1em;
		z-index: 1;
	}
	.wrapper span::before {
		position: absolute;
		-webkit-text-stroke: 0.1em black;
		z-index: 0;
	}
	.wrapper span:first-child {
		transform: translate(-1em, -0.6em);
	}
	.wrapper span:last-child {
		--color: var(--light);
		transform: translate(0.255em, 0.4em);
	}

	.auth {
		display: flex;
		width: 150px;
		justify-content: space-around;
		margin-top: 3rem;
	}
</style>
