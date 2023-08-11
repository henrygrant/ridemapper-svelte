import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { supabase, session } = await parent();
	if (!session) {
		throw redirect(303, '/');
	}

	const { data: userMetaData, error: userMetaError } = await supabase
		.from('user_meta')
		.select('*')
		.eq('user_id', session.user.id);
	if (userMetaError) console.error(userMetaError);
	const userMeta = userMetaData[0];
	const { data: activities, error: activitiesError } = await supabase
		.from('activities')
		.select('*')
		.order('start_date', { ascending: false })
		.eq('user_id', session.user.id);

	return {
		user: session.user,
		userMeta,
		activities
	};
};
