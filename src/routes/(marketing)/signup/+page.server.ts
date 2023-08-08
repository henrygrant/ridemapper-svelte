import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	signup: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${url.origin}/authcallback`
			}
		});
		if (error) {
			return fail(500, { error: 'Server error. Try again later.', email });
		}
		throw redirect(303, '/checkyouremail');
	}
};
