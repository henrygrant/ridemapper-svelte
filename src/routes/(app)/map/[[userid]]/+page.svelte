<script lang="ts">
	import { range } from '$lib/util';
	import { userMeta } from '$lib/store';
	import { downloadMap, makeMap, makeTileLayer, makeVectorLayer, shareMap } from '$lib/mapUtil.js';
	import type Map from 'ol/Map';

	export let data;

	$: ({ refreshUserMeta } = data);
	let { config, features, vectorLayer, tileLayer } = data;
	const { readOnly, mapThemes } = data;
	$: !readOnly && config && $userMeta?.user_id && updateMapPreferences($userMeta.user_id);

	let map: Map | null = null;
	let downloadEl;

	let timer;
	const handleColorSelection = (v) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			config.color = v;
		}, 100);
	};

	const updateMapPreferences = async (userId: string) => {
		let somethingChanged = false;
		if (config.theme !== $userMeta?.map_theme) {
			somethingChanged = true;
			map?.removeLayer(tileLayer);
			tileLayer = makeTileLayer(mapThemes[config.theme]);
			map?.getLayers().insertAt(0, tileLayer);
			await data.supabase.from('user_meta').upsert({
				user_id: userId,
				map_theme: config.theme
			});
		}
		if (config.color !== $userMeta?.map_line_color) {
			somethingChanged = true;
			map?.removeLayer(vectorLayer);
			vectorLayer = makeVectorLayer(features, config);
			map?.addLayer(vectorLayer);
			await data.supabase.from('user_meta').upsert({
				user_id: userId,
				map_line_color: config.color
			});
		}
		if (config.width !== $userMeta?.map_line_width) {
			somethingChanged = true;
			map?.removeLayer(vectorLayer);
			vectorLayer = makeVectorLayer(features, config);
			map?.addLayer(vectorLayer);
			await data.supabase.from('user_meta').upsert({
				user_id: userId,
				map_line_width: config.width
			});
		}
		if (somethingChanged) {
			await refreshUserMeta();
		}
	};

	const setupMap = (node, _id) => {
		map = makeMap();
		map.addLayer(tileLayer);
		map.addLayer(vectorLayer);
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

{#if !readOnly}
	<div class="controls">
		<button on:click={() => map && downloadMap(map, downloadEl)}>Download Map</button>
		{#if navigator.canShare()}
			<button on:click={() => map && shareMap(map)}>Share Map</button>
		{/if}
		<select
			value={$userMeta?.map_theme}
			on:change={({ currentTarget: { value } }) => (config.theme = value)}
		>
			{#each Object.keys(mapThemes) as theme}
				<option value={theme}>theme: {theme}</option>
			{/each}
		</select>
		<select bind:value={config.width}>
			{#each range(1, 21, 1) as i}
				<option value={i}>width: {i}</option>
			{/each}
		</select>
		<input
			type="color"
			value={$userMeta?.map_line_color}
			on:change={({ currentTarget: { value } }) => handleColorSelection(value)}
		/>
		<a bind:this={downloadEl} download="map.png" />
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
	.controls input {
		height: 40px;
		padding: 0.25rem;
	}
	#map {
		height: 100%;
	}
</style>
