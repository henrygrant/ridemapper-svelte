<script lang="ts">
	import Map from 'ol/Map';
	import View from 'ol/View';
	import TileLayer from 'ol/layer/Tile';
	import XYZ from 'ol/source/XYZ';
	import Polyline from 'ol/format/Polyline.js';
	import VectorLayer from 'ol/layer/Vector';
	import VectorSource from 'ol/source/Vector';
	import { fromLonLat } from 'ol/proj';
	import { Style, Stroke } from 'ol/style';
	import type Geometry from 'ol/geom/Geometry.js';
	import { range } from '../../../../lib/util';

	export let data;

	let { user, userMeta, activities } = data;
	let map: Map | null = null;
	let vectorLayer: VectorLayer<VectorSource<Geometry>> | null = null;
	let tileLayer: TileLayer<XYZ> | null = null;
	let color: string = userMeta.map_line_color || '#000000';
	let width: number = userMeta.map_line_width || 2;
	let theme: string = userMeta.map_theme || 'normal';
	const themes = {
		dark: 'https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png',
		light: 'https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png',
		normal: 'https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png'
	};
	$: ({ user, userMeta, activities } = data);
	$: features = activities
		? activities.map((activity) =>
				new Polyline({
					factor: 1e5
				}).readFeature(activity.polyline, {
					dataProjection: 'EPSG:4326',
					featureProjection: 'EPSG:3857'
				})
		  )
		: [];
	$: color, width, map && setupVectorLayer();
	$: color, width, theme && updateMapPreferences();
	$: theme && replaceTileLayer();

	const updateMapPreferences = async () => {
		await data.supabase.from('user_meta').upsert({
			user_id: user.id,
			map_theme: theme,
			map_line_color: color,
			map_line_width: width
		});
	};

	const replaceTileLayer = () => {
		if (tileLayer) {
			map?.removeLayer(tileLayer);
			tileLayer = new TileLayer({
				source: new XYZ({
					url: themes[theme]
				})
			});
			map?.getLayers().insertAt(0, tileLayer);
		}
	};

	const setupVectorLayer = () => {
		if (vectorLayer) {
			map?.removeLayer(vectorLayer);
		}
		vectorLayer = new VectorLayer({
			source: new VectorSource({
				features
			}),
			style: new Style({
				stroke: new Stroke({
					color,
					width
				})
			})
		});
		map?.addLayer(vectorLayer);
	};

	const setupMap = (node, _id) => {
		tileLayer = new TileLayer({
			source: new XYZ({
				url: themes[theme]
			})
		});
		map = new Map({
			target: 'map',
			layers: [tileLayer],
			view: new View({
				center: fromLonLat([-73.94186, 40.724545]),
				zoom: 11
			})
		});
		return {
			destroy() {
				if (map) {
					map.setTarget(undefined);
					map = null;
				}
			}
		};
	};
</script>

{#if (userMeta.user_id = user.id)}
	<div class="controls">
		<select bind:value={theme}>
			{#each Object.keys(themes) as theme}
				<option value={theme}>theme: {theme}</option>
			{/each}
		</select>
		<select bind:value={width}>
			{#each range(1, 21, 1) as i}
				<option value={i}>width: {i}</option>
			{/each}
		</select>
		<input type="color" bind:value={color} />
	</div>
{/if}
<div id="map" use:setupMap={'map'} />

<style>
	.controls {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 1rem;
		padding: 0.5rem 1rem;
		position: absolute;
		z-index: 2;
		right: 0;
	}
	#map {
		height: 100%;
	}
</style>
