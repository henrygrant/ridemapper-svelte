import { redirect } from '@sveltejs/kit';

// src/routes/login/+page.server.ts
export const actions = {
	default: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const password = formData.get('password') as string;

		const { error } = await supabase.auth.updateUser({
			password: password as string
		});

		throw redirect(303, '/');
	}
};
