import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { supabase, session } = await parent();
	if (!session) {
		throw redirect(303, '/');
	}

	// strava.config({
	// 	access_token: STRAVA_ACCESS_TOKEN,
	// 	client_id: STRAVA_CLIENT_ID,
	// 	client_secret: STRAVA_SECRET,
	// 	redirect_uri: url.origin + '/exchangestravacode'
	// });

	const { data: userMetaData, error: userMetaError } = await supabase
		.from('user_meta')
		.select('*')
		.eq('user_id', session.user.id);
	if (userMetaError) console.log(userMetaError);
	const userMeta = userMetaData[0];
	const { data: activities, error: activitiesError } = await supabase
		.from('activities')
		.select('*')
		.eq('user_id', session.user.id);

	return {
		user: session.user,
		userMeta,
		activities
	};
};
