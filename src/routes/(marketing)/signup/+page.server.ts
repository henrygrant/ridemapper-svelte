import { fail, redirect } from '@sveltejs/kit';

// src/routes/login/+page.server.ts
export const actions = {
	signup: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${url.origin}/authcallback`
			}
		});
		if (error) {
			return fail(500, { message: 'Server error. Try again later.', success: false, email });
		}
		// return {
		// 	message: 'Check your email.',
		// 	success: true
		// };
		throw redirect(303, '/checkyouremail');
	}
};
