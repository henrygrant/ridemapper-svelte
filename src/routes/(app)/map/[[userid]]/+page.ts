import { makeFeatures, makeTileLayer, makeVectorLayer } from '$lib/mapUtil';
import {activities, userMeta} from '$lib/store'
import { get } from 'svelte/store'

export const prerender = false;
export const ssr = false;

const mapThemes = {
	dark: 'https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png',
	light: 'https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png',
	normal: 'https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png'
}

export const load = async ({ parent, params }) => {
	const { supabase, session } = await parent();
	let mapUserMeta = get(userMeta)
	let mapActivities = get(activities)
	let readOnly = false
	if (params.userid && params.userid !== session.user.id) {
		readOnly = true
		const { data: otherUserMetaData, error: otherUserMetaError } = await supabase
			.from('user_meta')
			.select('*')
			.eq('user_id', params.userid)
			.single()
		if (otherUserMetaError) console.error(otherUserMetaError);
		mapUserMeta = otherUserMetaData;
		const { data: otherUserActivitiesData, error: otherUserActivitiesError } = await supabase
			.from('activities')
			.select('*')
			.eq('user_id', params.userid)
			.order('start_date', { ascending: false });
		if (otherUserActivitiesError) console.error(otherUserActivitiesError);
		mapActivities = otherUserActivitiesData;
	}
	const config = {
		color: mapUserMeta?.map_line_color || '#000000',
		width: mapUserMeta?.map_line_width || 2,
		theme: (mapUserMeta?.map_theme) || 'normal'
	};
	const features = mapActivities ? makeFeatures(mapActivities) : []
	const vectorLayer = makeVectorLayer(features, config)
	const tileLayer = makeTileLayer(mapThemes[config.theme]);
	return {
		readOnly,
		config,
		mapUserMeta,
		features,
		vectorLayer,
		tileLayer,
		mapThemes
	};
};
