import { STRAVA_SECRET } from '$env/static/private';
import { PUBLIC_STRAVA_CLIENT_ID } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

// src/routes/+layout.server.ts
export const load = async ({ locals: { getSession, supabase }, fetch }) => {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/');
	}
	const { data: userMeta, error } = await supabase
		.from('user_meta')
		.select('*')
		.eq('user_id', session.user.id);
	if (userMeta[0].strava_access_token && userMeta[0].strava_refresh_token) {
		try {
			const refreshResp = await fetch('https://www.strava.com/api/v3/oauth/token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					client_id: PUBLIC_STRAVA_CLIENT_ID,
					client_secret: STRAVA_SECRET,
					refresh_token: userMeta[0].strava_refresh_token,
					grant_type: 'refresh_token'
				})
			});
			const refreshJson = await refreshResp.json();
			const athleteResp = await fetch('https://www.strava.com/api/v3/athlete', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${userMeta[0].strava_access_token}`
				}
			});
			const shouldUpdateRides =
				!userMeta[0].strava_activities_updated_at ||
				Math.abs(new Date().getTime() - userMeta[0].strava_activities_updated_at) > 7200000;
			const athlete = await athleteResp.json();
			const { data: userMetaUpsertData, error: userMetaUpsertError } = await supabase
				.from('user_meta')
				.upsert({
					user_id: session.user.id,
					strava_firstname: athlete.firstname,
					strava_lastname: athlete.lastname,
					strava_profile_pic_url: athlete.profile,
					strava_id: athlete.id,
					strava_access_token: refreshJson.access_token,
					strava_refresh_token: refreshJson.refresh_token,
					strava_token_expires_at: refreshJson.expires_at,
					strava_token_expires_in: refreshJson.expires_in,
					strava_activities_updated_at: Date.now()
				})
				.select();
			if (userMetaUpsertError) throw userMetaUpsertError;
			if (shouldUpdateRides) {
				const activities: any[] = [];
				let page = 1;
				// eslint-disable-next-line no-constant-condition
				while (true) {
					const activitiesResp = await fetch(
						`https://www.strava.com/api/v3/athlete/activities?${new URLSearchParams({
							per_page: '200',
							page: page.toString()
						})}`,
						{
							method: 'GET',
							headers: {
								Authorization: `Bearer ${userMetaUpsertData[0].strava_access_token}`
							}
						}
					);
					const act = await activitiesResp.json();
					if (!act.length) break;
					activities.push(...act);
					page++;
				}
				const { data: activitiesUpsertData, error: activitiesUpsertError } = await supabase
					.from('activities')
					.upsert(
						activities.map((activity) => ({
							activity_id: activity.id,
							user_id: session.user.id,
							type: activity.type,
							name: activity.name,
							distance: activity.distance,
							elevation_gain: activity.total_elevation_gain,
							start_date: activity.start_date,
							utc_offset: activity.utc_offset,
							polyline: activity.map.summary_polyline,
							moving_time: activity.moving_time,
							elapsed_time: activity.elapsed_time
						}))
					);
				if (activitiesUpsertError) throw activitiesUpsertError;
			}
		} catch (e) {
			console.error(e);
		}
	}

	return {
		session
	};
};
