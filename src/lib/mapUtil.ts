import Polyline from 'ol/format/Polyline';
import type { Activity } from './types/types';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import Map from 'ol/Map';
import { Feature, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import type { Geometry } from 'ol/geom';
import { Style, Stroke } from 'ol/style';
import type { Size } from 'ol/size';

interface MapConfig {
	color: string;
	width: number;
	theme: string;
}

export const makeMap = () => {
	return new Map({
		target: 'map',
		view: new View({
			center: fromLonLat([-73.94186, 40.724545]),
			zoom: 11
		})
	});
};

export const makeFeatures = (activities: Activity[]) => {
	return activities.map((activity) =>
		new Polyline({
			factor: 1e5
		}).readFeature(activity.polyline, {
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:3857'
		})
	);
};

export const makeTileLayer = (themeUrl: string) => {
	return new TileLayer({
		source: new XYZ({
			url: themeUrl,
			crossOrigin: 'anonymous'
		})
	});
};

export const replaceTileLayer = (tileLayer: TileLayer<XYZ> | null, map: Map, themeUrl: string) => {
	tileLayer && map?.removeLayer(tileLayer);
	const ret = new TileLayer({
		source: new XYZ({
			url: themeUrl
		})
	});
	map?.getLayers().insertAt(0, ret);
	return ret;
};

export const makeVectorLayer = (features: Feature<Geometry>[], config: MapConfig) => {
	return new VectorLayer({
		source: new VectorSource({
			features: features
		}),
		style: new Style({
			stroke: new Stroke({
				color: config.color,
				width: config.width
			})
		})
	});
};

export const replaceVectorLayer = (
	vectorLayer: VectorLayer<VectorSource<Geometry>> | null,
	map: Map,
	activities: Activity[] | null,
	config: MapConfig
) => {
	vectorLayer && map?.removeLayer(vectorLayer);
	if (activities) {
		vectorLayer = new VectorLayer({
			source: new VectorSource({
				features: activities.map((activity) =>
					new Polyline({
						factor: 1e5
					}).readFeature(activity.polyline, {
						dataProjection: 'EPSG:4326',
						featureProjection: 'EPSG:3857'
					})
				)
			}),
			style: new Style({
				stroke: new Stroke({
					color: config.color,
					width: config.width
				})
			})
		});
		map?.addLayer(vectorLayer);
	}
};

export const downloadMap = (map: Map, anchor: HTMLAnchorElement) => {
	map.once('rendercomplete', function () {
		const mapCanvas = document.createElement('canvas');
		const size = map.getSize() as Size;
		mapCanvas.width = size[0];
		mapCanvas.height = size[1];
		const mapContext = mapCanvas.getContext('2d') as CanvasRenderingContext2D;
		Array.prototype.forEach.call(
			map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer'),
			function (canvas) {
				if (canvas.width > 0) {
					const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
					mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
					let matrix;
					const transform = canvas.style.transform;
                    const scale = window.devicePixelRatio
					if (transform) {
						// Get the transform parameters from the style's transform matrix
						matrix = transform
							.match(/^matrix\(([^(]*)\)$/)[1]
							.split(',')
							.map(Number);
					} else {
						matrix = [
							(parseFloat(canvas.style.width) / canvas.width) * scale,
							0,
							0,
							(parseFloat(canvas.style.height) / canvas.height) * scale,
							0,
							0
						];
					}
					// Apply the transform to the export map context
					CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
					const backgroundColor = canvas.parentNode.style.backgroundColor;
					if (backgroundColor) {
						mapContext.fillStyle = backgroundColor;
						mapContext.fillRect(0, 0, canvas.width, canvas.height);
					}
					mapContext.drawImage(canvas, 0, 0);
				}
			}
		);
		mapContext.globalAlpha = 1;
		mapContext.setTransform(1, 0, 0, 1, 0, 0);
		anchor.href = mapCanvas.toDataURL();
		anchor.click();
	});
	map.renderSync();
};

export const shareMap = (map: Map) => {
	map.once('rendercomplete', function () {
		const mapCanvas = document.createElement('canvas');
		const size = map.getSize() as Size;
		mapCanvas.width = size[0];
		mapCanvas.height = size[1];
		const mapContext = mapCanvas.getContext('2d') as CanvasRenderingContext2D;
		Array.prototype.forEach.call(
			map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer'),
			function (canvas) {
				if (canvas.width > 0) {
					const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
					mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
					let matrix;
					const transform = canvas.style.transform;
                    const scale = window.devicePixelRatio
					if (transform) {
						// Get the transform parameters from the style's transform matrix
						matrix = transform
							.match(/^matrix\(([^(]*)\)$/)[1]
							.split(',')
							.map(Number);
					} else {
						matrix = [
							(parseFloat(canvas.style.width) / canvas.width) * scale,
							0,
							0,
							(parseFloat(canvas.style.height) / canvas.height) * scale,
							0,
							0
						];
					}
					// Apply the transform to the export map context
					CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
					const backgroundColor = canvas.parentNode.style.backgroundColor;
					if (backgroundColor) {
						mapContext.fillStyle = backgroundColor;
						mapContext.fillRect(0, 0, canvas.width, canvas.height);
					}
					mapContext.drawImage(canvas, 0, 0);
				}
			}
		);
		mapContext.globalAlpha = 1;
		mapContext.setTransform(1, 0, 0, 1, 0, 0);
		const url = mapCanvas.toDataURL();
		fetch(url)
			.then((res) => res.blob())
			.then((blob) => {
				const file = new File([blob], 'map.png', { type: 'image/png' });
				navigator.share({
					files: [file]
				});
			});
	});
	map.renderSync();
};
