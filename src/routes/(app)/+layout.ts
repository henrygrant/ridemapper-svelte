// src/routes/+layout.ts
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import type { Database } from '../../../database.types';
import { redirect } from '@sveltejs/kit';
import {activities, userMeta} from '$lib/store'
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	const supabase = createSupabaseLoadClient<Database>({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data?.session
	});

	const {
		data: { session }
	} = await supabase.auth.getSession();
	if (!session) {
		throw redirect(303, '/');
	}

	const refreshUserMeta = async () => {
		const { data, error } = await supabase
			.from('user_meta')
			.select('*')
			.eq('user_id', session.user.id)
			.single()
		if (error) console.error(error);
		userMeta.set(data)
	}
	await refreshUserMeta()

	const refreshActivities = async () => {
		const { data, error } = await supabase
			.from('activities')
			.select('*')
			.eq('user_id', session.user.id)
			.order('start_date', { ascending: false });
		if (error) console.error(error);
		activities.set(data)
	}
	await refreshActivities()

	return { supabase, session, streamed: data?.streamed, refreshUserMeta, refreshActivities };
};
