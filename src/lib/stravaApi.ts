import { STRAVA_SECRET } from '$env/static/private';
import { PUBLIC_STRAVA_CLIENT_ID } from '$env/static/public';

interface StravaRefreshTokenResponse {
	access_token: string;
	expires_at: number;
	expires_in: number;
	refresh_token: string;
}

export async function refreshStravaToken(userRefreshToken: string) {
	try {
		const resp = await fetch('https://www.strava.com/api/v3/oauth/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				client_id: PUBLIC_STRAVA_CLIENT_ID,
				client_secret: STRAVA_SECRET,
				refresh_token: userRefreshToken,
				grant_type: 'refresh_token'
			})
		});
		if (!resp.ok) {
			throw new Error(`Failed to refresh Strava token. status: ${resp.status}`);
		}
		return (await resp.json()) as StravaRefreshTokenResponse;
	} catch (err) {
		console.error(err);
	}
}

export async function getStravaAthlete(userAccessToken: string) {
	try {
		const resp = await fetch('https://www.strava.com/api/v3/athlete', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${userAccessToken}`
			}
		});
		if (!resp.ok) {
			throw new Error(`Failed to get Strava athlete. status: ${resp.status}`);
		}
		return await resp.json();
	} catch (err) {
		console.error(err);
	}
}

export async function getAllStravaActivities(userAccessToken: string) {
	const activities: any[] = [];
	let page = 1;
	try {
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const resp = await fetch(
				`https://www.strava.com/api/v3/athlete/activities?${new URLSearchParams({
					per_page: '200',
					page: page.toString()
				})}`,
				{
					method: 'GET',
					headers: {
						Authorization: `Bearer ${userAccessToken}`
					}
				}
			);
			if (!resp.ok) {
				throw new Error(`Failed to get Strava activities. status: ${resp.status}`);
			}
			const activity = await resp.json();
			if (!activity.length) break;
			activities.push(...activity);
			page++;
		}
		return activities;
	} catch (err) {
		console.error(err);
	}
}
