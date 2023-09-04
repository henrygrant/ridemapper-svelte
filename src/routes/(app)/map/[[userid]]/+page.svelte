<script lang="ts">
	import { range } from '$lib/util';
	import { userMeta } from '$lib/store';
	import { downloadMap, makeMap, makeTileLayer, makeVectorLayer, shareMap } from '$lib/mapUtil.js';
	import type Map from 'ol/Map';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faShare, faDownload } from '@fortawesome/free-solid-svg-icons';
	import ColorPicker from 'svelte-awesome-color-picker';

	export let data;

	$: ({ refreshUserMeta } = data);
	let { config, features, vectorLayer, tileLayer } = data;
	const { readOnly, mapThemes } = data;
	$: !readOnly && config && $userMeta?.user_id && updateMapPreferences($userMeta.user_id);

	let map: Map | null = null;
	let downloadEl;

	let hex = config.color;
	$: handleColorSelection(hex);
	let timer;
	const handleColorSelection = (hex) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			console.log(hex);
			config.color = hex;
		}, 50);
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
		<div class="left">
			<div class="optionContainer">
				<div>Line Color:</div>
				<ColorPicker bind:hex canChangeMode={false} isAlpha={false} label="" />
			</div>
			<div class="optionContainer">
				<div>Line Width:</div>
				<select bind:value={config.width}>
					{#each range(1, 21, 1) as i}
						<option value={i}>{i}</option>
					{/each}
				</select>
			</div>
			<div class="optionContainer">
				<div>Map Theme:</div>
				<select
					value={$userMeta?.map_theme}
					on:change={({ currentTarget: { value } }) => (config.theme = value)}
				>
					{#each Object.keys(mapThemes) as theme}
						<option value={theme}>{theme}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="right">
			<button on:click={() => map && downloadMap(map, downloadEl)}
				><FontAwesomeIcon icon={faDownload} size="xl" /></button
			>
			<button on:click={() => map && shareMap(map)}
				><FontAwesomeIcon icon={faShare} size="xl" /></button
			>
			<a bind:this={downloadEl} download="map.png" />
		</div>
	</div>
{/if}
<div id="map" use:setupMap={'map'} />

<style>
	.controls {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 0.5rem 1rem;
		position: absolute;
		z-index: 2;
		width: 100vw;
		/* right: 0; */
	}
	.controls .left {
		display: flex;
		flex-direction: column;
		background-color: var(--dark);
		padding: 1.3rem .75rem .75rem;
		border: 2px solid black;
		gap: 1.5rem;

	}
	.controls .right {
		display: flex;
		gap: 1rem;
	}
	.controls .right button {
		padding: .75rem;
	}
	.optionContainer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		font-weight: bold;
		font-size: 12px;
	}
	#map {
		height: 100%;
	}
</style>
