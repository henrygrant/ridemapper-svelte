<script lang="ts">
	import { PUBLIC_STRAVA_CLIENT_ID } from '$env/static/public';
	import { page } from '$app/stores';
	export let data;
	let { user, userMeta, activities } = data;
	$: ({ user, userMeta, activities } = data);
</script>

{#if !userMeta.strava_id}
	<div class="strava-athlete-card">
		<a
			href={`http://www.strava.com/oauth/authorize?client_id=${PUBLIC_STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${$page.url.origin}/exchangestravatoken&approval_prompt=force&scope=read,activity:read`}
		>
			<h2 class="strava-athlete-card-title">Connect Strava</h2>
		</a>
	</div>
{:else}
	<div class="strava-athlete-card">
		<div class="strava-athlete-card-avatar">
			<img src={userMeta.strava_profile_pic_url} alt="avatar" />
		</div>
		<a href="https://www.strava.com/athletes/${userMeta.strava_id}" target="_blank">
			<h2 class="strava-athlete-card-title">
				{userMeta.strava_firstname}
				{userMeta.strava_lastname}
			</h2>
		</a>
		<p class="strava-athlete-card-id">Strava ID: ${userMeta.strava_id}</p>
	</div>
	<div class="auth-controls">
		<form action="/signout" method="POST"><button>Signout</button></form>
	</div>
	<div class="strava-activity-container">
		{#if activities && activities.length}
			{#each activities as activity}
				<div class="strava-activity-card">
					<a href="https://strava.com/activities/${activity.id}" target="_blank">
						<h3>{activity.name}</h3>
					</a>
					<div>{activity.type} on {new Date(activity.start_date).toLocaleDateString('en-US')}</div>
					<div class="strava-activity-metrics">
						<div>{(activity.distance * 0.000621371192).toFixed(2)}mi</div>
						<div>{(activity.elevation_gain * 0.3048).toFixed(1)}ft</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
{/if}

<style>
	.auth-controls {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}

	.strava-athlete-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 4rem;
	}

	.strava-athlete-card-title {
		margin-bottom: 0.5rem;
	}

	.strava-athlete-card-id {
		margin: 0;
	}

	.strava-activity-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		gap: 1rem;
		padding: 1rem;
	}

	.strava-activity-card {
		border: 1px solid var(--darker);
		background-color: var(--light);
		padding: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.strava-activity-metrics {
		width: 100%;
		display: flex;
		justify-content: space-between;
		column-gap: 1rem;
	}
</style>
