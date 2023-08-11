<script lang="ts">
	export let data;
	const { data: users } = data;
</script>

<div class="container">
	{#if users && users.length}
		{#each users as user}
			<div class="user">
				<div class="avatar">
					<img src={user.strava_profile_pic_url} alt="avatar" />
				</div>
				<div class="links">
					<a href="https://www.strava.com/athletes/{user.strava_id}" target="_blank">
						<h2 class="name">
							{user.strava_firstname}
							{user.strava_lastname}
						</h2>
					</a>
					<a href="/map/{user.user_id}">View Map</a>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
		padding: 1rem;
	}

	.avatar {
		width: 140px;
	}

	.avatar img {
		width: 100%;
	}

	.name {
		font-weight: bold;
		font-size: 1.75rem;
	}

	.user {
		display: flex;
		align-items: center;
		border: 2px solid black;
		gap: 1rem;
		background-color: var(--light);
		justify-content: space-between;
	}

	.links {
		display: flex;
		flex-direction: column;
		text-align: center;
		width: 100%;
	}
</style>
