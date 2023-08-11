import { redirect } from '@sveltejs/kit';
import { getAllStravaActivities, getStravaAthlete, refreshStravaToken } from '$lib/stravaApi';
import { dateIsOlderThanTwoHours } from '$lib/util';

export const load = async ({ locals: { getSession, supabase } }) => {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/');
	}

	const bigUpdatePromise = async () => {
		const { data: userMetaResp, error } = await supabase
			.from('user_meta')
			.select('*')
			.eq('user_id', session.user.id);
		if (error) {
			console.error(error);
			throw new Error('Failed to get user metadata from database');
		}
		const userMeta = userMetaResp[0];

		if (userMeta.strava_access_token && userMeta.strava_refresh_token) {
			const updatedStravaTokenInfo = await refreshStravaToken(userMeta.strava_refresh_token);

			if (updatedStravaTokenInfo) {
				const athlete = await getStravaAthlete(updatedStravaTokenInfo.access_token);
				const shouldUpdateRides =
					!userMeta.strava_activities_updated_at ||
					dateIsOlderThanTwoHours(userMeta.strava_activities_updated_at);
				const { error: userMetaUpdatedError } = await supabase.from('user_meta').upsert({
					user_id: session.user.id,
					strava_firstname: athlete.firstname,
					strava_lastname: athlete.lastname,
					strava_profile_pic_url: athlete.profile,
					strava_id: athlete.id,
					strava_access_token: updatedStravaTokenInfo.access_token,
					strava_refresh_token: updatedStravaTokenInfo.refresh_token,
					strava_token_expires_at: updatedStravaTokenInfo.expires_at,
					strava_token_expires_in: updatedStravaTokenInfo.expires_in,
					strava_activities_updated_at: Date.now()
				});
				if (userMetaUpdatedError) {
					console.error(userMetaUpdatedError);
					throw new Error('Failed to update the database with new user metadata');
				}

				if (shouldUpdateRides) {
					const activities = await getAllStravaActivities(updatedStravaTokenInfo.access_token);
					if (activities) {
						const { error: activitiesUpsertError } = await supabase.from('activities').upsert(
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
						if (activitiesUpsertError) {
							console.error(activitiesUpsertError);
							throw new Error('Failed to update the database with new activities');
						}
						const { error: userMetaUpdatedAgainError } = await supabase.from('user_meta').upsert({
							user_id: session.user.id,
							strava_activities_updated_at: Date.now()
						});
						if (userMetaUpdatedAgainError) {
							console.error(userMetaUpdatedAgainError);
							throw new Error('Failed to update the usermetadata with new strava update time');
						}
					}
				}
			}
		}
	};

	return {
		session,
		streamed: {
			bigUpdatePromise: bigUpdatePromise()
		}
	};
};
