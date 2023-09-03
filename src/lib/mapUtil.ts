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
			url: themeUrl
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
    return ret
};

export const makeVectorLayer = (
	features: Feature<Geometry>[],
	config: MapConfig
) => {
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
