import { redirect } from '@sveltejs/kit';
import { PUBLIC_STRAVA_CLIENT_ID } from '$env/static/public';
import { STRAVA_SECRET } from '$env/static/private';

export const GET = async ({ url, locals: { supabase }, fetch }) => {
	try {
		const code = url.searchParams.get('code');

		if (!code) {
			console.error('no code provided to /exchangeStravaCode');
			throw redirect(303, '/dashboard');
		}
		const resp = await fetch('https://www.strava.com/api/v3/oauth/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				client_id: PUBLIC_STRAVA_CLIENT_ID,
				client_secret: STRAVA_SECRET,
				code,
				grant_type: 'authorization_code'
			})
		});
		const json = await resp.json();
		const {
			data: { session },
			error
		} = await supabase.auth.getSession();
		if (error) throw error;
		if (!session) throw new Error('No session in strava.ts');
		const userId = session?.user.id;
		const { error: upsertError } = await supabase.from('user_meta').upsert({
			user_id: userId,
			strava_token_expires_in: json.expires_in,
			strava_token_expires_at: json.expires_at,
			strava_refresh_token: json.refresh_token,
			strava_access_token: json.access_token,
			strava_firstname: json.athlete.firstname,
			strava_lastname: json.athlete.lastname,
			strava_profile_pic_url: json.athlete.profile,
			strava_id: json.athlete.id
		});
		if (upsertError) throw upsertError;
	} catch (e) {
		console.error(e);
	}
	throw redirect(303, '/dashboard');
};
