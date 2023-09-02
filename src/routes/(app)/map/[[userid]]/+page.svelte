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
	import type { Size } from 'ol/size';

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
	$: ({ user, userMeta, activities, isOwnMap } = data);
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
	$: userMeta.map_line_color, userMeta.map_line_width, map && setupVectorLayer();
	$: color, width, theme && updateMapPreferences();
	$: userMeta.map_theme && replaceTileLayer();

	let timer;
	const debounce = (v) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			color = v;
		}, 100);
	};

	const updateMapPreferences = async () => {
		let somethingChanged = false;
		if (theme !== userMeta.map_theme) {
			somethingChanged = true;
			await data.supabase.from('user_meta').upsert({
				user_id: user.id,
				map_theme: theme
			});
		}
		if (color !== userMeta.map_line_color) {
			somethingChanged = true;
			await data.supabase.from('user_meta').upsert({
				user_id: user.id,
				map_line_color: color
			});
		}
		if (width !== userMeta.map_line_width) {
			somethingChanged = true;
			await data.supabase.from('user_meta').upsert({
				user_id: user.id,
				map_line_width: width
			});
		}
		if (somethingChanged) {
			const { data: userMetaResp } = await data.supabase
				.from('user_meta')
				.select('*')
				.eq('user_id', user.id)
				.single();
			userMeta = userMetaResp ?? userMeta;
		}
	};

	const replaceTileLayer = () => {
		if (tileLayer) {
			map?.removeLayer(tileLayer);
			tileLayer = new TileLayer({
				source: new XYZ({
					url: themes[theme],
					crossOrigin: 'anonymous'
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

	const downloadMap = () => {
		const mapCanvas = document.createElement('canvas') as HTMLCanvasElement;
		const size = map?.getSize() as Size;
		mapCanvas.width = size[0];
		mapCanvas.height = size[1];
		const mapContext = mapCanvas.getContext('2d') as CanvasRenderingContext2D;
		const canvases = map
			?.getViewport()
			.querySelectorAll('.ol-layer canvas, canvas.ol-layer') as NodeListOf<HTMLCanvasElement>;
		canvases?.forEach((canvas) => {
			if (canvas.width > 0) {
				const opacity = canvas?.parentNode?.style?.opacity || canvas.style.opacity;
				mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
				let matrix;
				const transform = canvas.style.transform as string;
				if (transform) {
					matrix = transform
						.match(/^matrix\(([^\(]*)\)$/)[1]
						.split(',')
						.map(Number);
					console.log(transform, matrix);
				} else {
					matrix = [
						parseFloat(canvas.style.width) / canvas.width,
						0,
						0,
						parseFloat(canvas.style.height) / canvas.height,
						0,
						0
					];
					console.log(matrix);
				}
				// Apply the transform to the export map context
				// CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
				// const backgroundColor = canvas?.parentNode?.style?.backgroundColor;
				// if (backgroundColor) {
				// 	mapContext.fillStyle = backgroundColor;
				// 	mapContext.fillRect(0, 0, canvas.width, canvas.height);
				// }
				mapContext.drawImage(canvas, 0, 0);
			}
		});
		mapContext.globalAlpha = 1;
		mapContext.setTransform(1, 0, 0, 1, 0, 0);
		console.log(mapContext);
		console.log(mapCanvas);
		const link = document.getElementById('image-download') as HTMLElement;
		link.href = mapCanvas.toDataURL();
		link.click();
	};

	const setupMap = (node, _id) => {
		tileLayer = new TileLayer({
			source: new XYZ({
				url: themes[theme],
				crossOrigin: 'anonymous'
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

{#if isOwnMap}
	<div class="controls">
		<button on:click={() => downloadMap()}>Download</button>
		<a id="image-download" download="map.png" />
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
		<input
			type="color"
			value={userMeta.map_line_color}
			on:change={({ target: { value } }) => debounce(value)}
		/>
	</div>
{/if}
<div id="map" use:setupMap={'map'} />

<style>
	.container {
		height: 100%;
	}
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
