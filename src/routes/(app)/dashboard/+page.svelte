<script lang="ts">
	import { PUBLIC_STRAVA_CLIENT_ID } from '$env/static/public';
	import { page } from '$app/stores';
	export let data;
	let { user, userMeta, activities } = data;
	$: ({ user, userMeta, activities } = data);
</script>

{#if userMeta && userMeta.strava_id}
	<div class="athlete-card">
		<div class="athlete-card-avatar">
			<img src={userMeta.strava_profile_pic_url} alt="avatar" />
		</div>
		<a href="https://www.strava.com/athletes/{userMeta.strava_id}" target="_blank">
			<h2 class="athlete-card-title">
				{userMeta.strava_firstname}
				{userMeta.strava_lastname}
			</h2>
		</a>
		<p class="athlete-card-id">Strava ID: {userMeta.strava_id}</p>
	</div>
	<div class="auth-controls">
		<form action="/signout" method="POST"><button>Signout</button></form>
	</div>
	<div class="activity-container">
		{#if activities && activities.length}
			{#each activities as activity}
				<div class="activity-card">
					<a href="https://strava.com/activities/{activity.id}" target="_blank">
						<h3 class="activity-name">{activity.name}</h3>
					</a>
					<div>
						{activity.type} on {new Date(activity.start_date).toLocaleDateString('en-US')}
					</div>
					<div class="activity-metrics">
						<div>{(activity.distance * 0.000621371192).toFixed(2)}mi</div>
						<div>{(activity.elevation_gain * 0.3048).toFixed(1)}ft</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
{:else}
	<div class="connect-container">
		<a
			href={`http://www.strava.com/oauth/authorize?client_id=${PUBLIC_STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${$page.url.origin}/exchangestravatoken&approval_prompt=force&scope=read,activity:read`}
		>
			<button>Connect Strava</button>
		</a>
		<div class="auth-controls">
			<form action="/signout" method="POST"><button>Signout</button></form>
		</div>
	</div>
{/if}

<style>
	.auth-controls {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}

	.connect-container {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 2rem;
	}

	.athlete-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 4rem auto 0;
		padding: 1rem;
		border: 2px solid black;
		background-color: var(--light);
	}

	.athlete-card-title {
		margin-bottom: 0.5rem;
		font-weight: bold;
		font-size: 1.75rem;
	}

	.athlete-card-id {
		margin: 0;
	}

	.activity-container {
		display: grid;
		grid-template-columns: 1fr minmax(auto, 600px) 1fr;
		grid-auto-rows: auto;
		grid-auto-flow: row;
		gap: 1rem;
		padding: 1rem;
		align-items: center;
		margin-top: 4rem;
	}

	.activity-name {
		font-weight: bold;
		font-size: 1.5rem;
	}

	.activity-card {
		grid-column: 2/3;
		border: 2px solid black;
		background-color: var(--light);
		padding: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		flex-grow: 1;
	}

	.activity-metrics {
		width: 100%;
		display: flex;
		justify-content: space-between;
		column-gap: 1rem;
	}
</style>
