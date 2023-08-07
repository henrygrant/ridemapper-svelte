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
					<a href="https://www.strava.com/athletes/${user.strava_id}" target="_blank">
						<h2 class="name">
							{user.strava_firstname}
							{user.strava_lastname}
						</h2>
					</a>
					<a href="https://www.strava.com/athletes/${user.strava_id}" target="_blank">View Map</a>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 4rem;
		gap: 4rem;
		margin-bottom: 4rem;
	}

	.user {
		display: flex;
		align-items: center;
		border: 1px solid var(--darker);
		padding: 1rem;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.links {
		display: flex;
		flex-direction: column;
		text-align: center;
	}
</style>
