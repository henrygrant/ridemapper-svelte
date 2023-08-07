import { redirect } from '@sveltejs/kit';

// src/routes/+layout.server.ts
export const load = async ({ locals: { getSession } }) => {
	const session = await getSession();
	if (session) {
		throw redirect(303, '/dashboard');
	}
	return {
		session
	};
};
