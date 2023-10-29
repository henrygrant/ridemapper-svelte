<script>
	import { goto } from '$app/navigation';
</script>

<div class="container">
	<h2>Check your email</h2>
	<button on:click={() => goto('/')}>Back to Home</button>
</div>

<style>
	.container {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
</style>
