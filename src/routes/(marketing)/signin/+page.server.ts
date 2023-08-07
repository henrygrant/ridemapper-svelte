import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';

// src/routes/login/+page.server.ts
export const actions = {
	signin: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					error: 'Invalid credentials.',
					email
				});
			}
			return fail(500, {
				error: 'Server error. Try again later.',
				email
			});
		}

		throw redirect(303, '/dashboard');
	},
	resetpassword: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		console.log(email);
		const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${url.origin}/updatepassword`
		});

		if (error) {
			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					error: 'Invalid credentials.',
					email
				});
			}
			return fail(500, {
				error: 'Server error. Try again later.',
				email
			});
		}
		throw redirect(303, '/checkyouremail');
		// return data;
	}
};
