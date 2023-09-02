<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '../../database.types';
	export let activity: Database['public']['Tables']['activities']['Row'];
	export let supabase: SupabaseClient<Database>;
	let enabled = activity.enabled;
	$: if (enabled != activity.enabled) {
		toggle(enabled);
	}
	let loading = false;
	const toggle = async (val) => {
		loading = true;
		const { data, error } = await supabase
			.from('activities')
			.update({ enabled: val })
			.eq('activity_id', activity.activity_id)
			.select()
			.single();
		if (error) console.error(error);
		if (data) activity = data;
		loading = false;
	};
</script>

<div class="activity">
	<input type="checkbox" bind:checked={enabled} />
	<a href="https://strava.com/activities/{activity.id}" target="_blank">
		<h3 class="name">{activity.name}</h3>
	</a>
	<div class="type">
		{activity.type} on {new Date(activity.start_date).toLocaleDateString('en-US')}
	</div>
	<div class="metrics">
		<div>{(activity.distance * 0.000621371192).toFixed(2)}mi</div>
		<div>{(activity.elevation_gain * 0.3048).toFixed(1)}ft</div>
	</div>
</div>

<style>
	.activity {
		border: 2px solid black;
		background-color: var(--light);
		padding: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
	}

	.name {
		font-weight: bold;
		font-size: 1.5rem;
	}

	.metrics {
		width: 100%;
		display: flex;
		justify-content: space-between;
		column-gap: 1rem;
	}
</style>
