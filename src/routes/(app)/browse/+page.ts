import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { supabase, session } = await parent();
	if (!session) {
		throw redirect(303, '/');
	}
	const { data, error } = await supabase
		.from('user_meta')
		.select(
			`user_id,\
		strava_id,\
		strava_firstname,\
		strava_lastname,\
		strava_profile_pic_url,\
		map_line_color,\
		map_line_width,\
		map_theme`
		)
		.neq('strava_id', null);
	if (error) console.log(error);
	return {
		data
	};
};
