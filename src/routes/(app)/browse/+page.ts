import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { supabase, session } = await parent();
	if (!session) {
		throw redirect(303, '/');
	}
	const { data, error } = await supabase.from('user_meta').select('*');
	if (error) console.log(error);
	return {
		data
	};
};
