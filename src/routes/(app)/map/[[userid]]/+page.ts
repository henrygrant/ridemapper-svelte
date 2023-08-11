// import { redirect } from '@sveltejs/kit';

import { redirect } from '@sveltejs/kit';

export const prerender = false;
export const ssr = false;

export const load = async ({ parent, params }) => {
	const { supabase, session } = await parent();
	if (!session) {
		throw redirect(303, '/');
	}

	const userId = params.userid || session.user.id;

	const { data: userMetaData, error: userMetaError } = await supabase
		.from('user_meta')
		.select('*')
		.eq('user_id', userId);
	if (userMetaError) console.error(userMetaError);
	const userMeta = userMetaData[0];
	const { data: activities, error: activitiesError } = await supabase
		.from('activities')
		.select('*')
		.eq('user_id', userId);

	return {
		user: session.user,
		userMeta,
		activities
	};
};
