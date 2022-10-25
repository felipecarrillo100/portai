import React, {useEffect, useRef} from "react";
import {Map} from "@luciad/ria/view/Map";
import {WebGLMap} from "@luciad/ria/view/WebGLMap";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";

import "./CartesianMap.scss";
import {useSelector} from "react-redux";
import {IAppState} from "../../../reduxboilerplate/store";
import {CoordinateReference} from "@luciad/ria/reference/CoordinateReference";
import {RasterTileSetLayer} from "@luciad/ria/view/tileset/RasterTileSetLayer";
import {createBounds} from "@luciad/ria/shape/ShapeFactory";
import {UrlTileSetModelCartesian} from "../models/UrlTileSetModelCartesian";
import {Point} from "@luciad/ria/shape/Point";
import {MouseCoordinateReadout} from "../mousecoordinates/MouseCoordinateReadout";
import {MemoryStore} from "@luciad/ria/model/store/MemoryStore";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {CartesianAnnotationsPainter} from "./CartesianAnnotationsPainter";
import {boolean} from "@luciad/ria/util/expression/ExpressionFactory";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {FeaturesRestAPIStore} from "../stores/FeaturesRestAPIStore";

interface Props {
    layer: FeatureLayer;
    onVisibilityChange?: (v: boolean) => void;
    onMapChange?: (map: Map) => void;
    className?: string;
    id?: string;
    feature: Feature;
    type: string;
    navigation?: number;
    setNavigation?: (navigation:number)=>void;
}

interface StateProps {
    mainMap: Map | null;
}

export const CARTESIAN_RASTER_LAYER_ID = "raster-layer-id";
export const CARTESIAN_LAYER_FEATURES_ID = "features-layer-id";
const crs1Reference = getReference("CRS:1");

const PortCartesianMap: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {
    const divEl = useRef(null);
    const map = useRef(null as Map | null);
    const className = "CartesianMap"+ (typeof props.className !== "undefined" ? " " + props.className : "");

    const { mainMap } = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            mainMap: state.luciadMap.map,
        }
    });

    const initializeMap = (map: Map) => {
        createListener(map);
        createRasterLayer(map);
        createRestAPIFeatureLayer(map);
        if (typeof props.onMapChange === "function") props.onMapChange(map);
    }

    const createRestAPIFeatureLayer = (map: Map) => {
        const createAnnotationsLayer = () =>{
            const filename = getFilename();
            const url = "./annotations/" + filename.replace(/\//g, "_").replace(/\./g, "_");
            const featureStore = new FeaturesRestAPIStore({url, reference: crs1Reference});
            const featureModel = new FeatureModel(featureStore, {
                reference: crs1Reference
            });
            return new FeatureLayer(featureModel, {
                selectable: true,
                editable: true,
                visible: true,
                id: CARTESIAN_LAYER_FEATURES_ID,
                label: "Annotations"
            });
        }
        const layer = createAnnotationsLayer();
        layer.on("VisibilityChanged", (v: boolean) => {
            if (typeof props.onVisibilityChange === "function"){
                props.onVisibilityChange(v);
            }
        });
        layer.painter = new CartesianAnnotationsPainter();
        map.layerTree.addChild(layer, "top");
    }

    const createListener = (map: Map) => {
      // @ts-ignore
        map.on('MapChange', ()=>{
            const layerImage = map.layerTree.findLayerById(CARTESIAN_RASTER_LAYER_ID) as any;
            if (layerImage && typeof props.navigation !== "undefined") {
                    const myMap = map;
                    const layerImage = myMap.layerTree.findLayerById(CARTESIAN_RASTER_LAYER_ID) as any;
                    if (layerImage && typeof props.navigation !== "undefined") {
                        const step = layerImage.model.bounds.width/100;
                        let returnValue = 0;
                        if (myMap.mapBounds.x===0) {
                            returnValue = 0;
                        } else
                        if (myMap.mapBounds.x + myMap.mapBounds.width >= layerImage.model.bounds.width)  {
                            returnValue = 100;
                        } else {
                            returnValue = Math.round(myMap.mapBounds.x  / step );
                        }
                        // console.log("Accuracy 2: " + returnValue)
                        if (typeof props.setNavigation === "function" && props.navigation !== returnValue) {
                            //   console.log("Internal call: " + returnValue)
                            props.setNavigation(returnValue);
                        }
                    }
            }
      })
    }

    const getFilename = () => {
        let fileOrFileName = "";
        const store = props.layer.model.store as any;
        const url = store.url;
        const baseUrl = url.substring(0, url.lastIndexOf("/"));
        const image = props.feature.properties.image;
        fileOrFileName = `${baseUrl}${image}`;
        return fileOrFileName;
    }
    const createRasterLayer = (map: Map) => {
        const fileOrFileName = getFilename();

        createLayer("Photo", fileOrFileName, crs1Reference).then(layer => {
            setCRS1ImageLayer(map, layer);
        }).catch(error => console.log(`Cannot add layer: ${error.message}`, error))
    }

    useEffect(()=>{
        if (divEl.current !== null && map.current===null) {
            map.current = new WebGLMap(divEl.current, { reference: crs1Reference });
            initializeMap(map.current);
        }
    }, [divEl.current]);

    useEffect(()=>{
        console.log("Needs update: " + props.navigation);
        if (map.current){
            const layerImage = map.current.layerTree.findLayerById(CARTESIAN_RASTER_LAYER_ID) as any;
            if (layerImage && typeof props.navigation !== "undefined") {
                const step = layerImage.model.bounds.width/100;
                const bounds = createBounds(crs1Reference, [step * props.navigation, map.current?.mapBounds.width, 0, layerImage.model.bounds.height]);
                const a =props.navigation;
                map.current.mapNavigator.fit({bounds: bounds, animate: {duration: 250}}).then(()=>{
                    console.log("requested: "+ a);
                    if (map.current) {
                        const myMap = map.current;
                        const layerImage = myMap.layerTree.findLayerById(CARTESIAN_RASTER_LAYER_ID) as any;
                        if (layerImage && typeof props.navigation !== "undefined") {
                            const step = layerImage.model.bounds.width/100;
                            let returnValue = 0;
                            if (myMap.mapBounds.x===0) {
                                returnValue = 0;
                            } else
                            if (myMap.mapBounds.x + myMap.mapBounds.width >= layerImage.model.bounds.width)  {
                                returnValue = 100;
                            } else {
                                returnValue = Math.round(myMap.mapBounds.x  / step );
                            }
                            // console.log("Accuracy: " + returnValue)
                        }
                    }
                });
            }
        }
    }, [props.navigation]);


    const createLayer = (layerName: string, fileOrURL: string, reference: CoordinateReference): Promise<RasterTileSetLayer> => {
        return new Promise((resolve, reject) => {
            fetch(fileOrURL+"?service=GetInfo")
                .then(response => {
                    return response.json();
                })
                .then(imageInfo => {
                    const urlTileSetModel = new UrlTileSetModelCartesian({
                        reference,
                        bounds: createBounds(reference, [0, imageInfo.totalWidth, 0, imageInfo.totalHeight]),
                        baseURL: fileOrURL,
                        levelCount: 1,
                        level0Columns: imageInfo.columns,
                        level0Rows: imageInfo.rows,
                        // tileWidth: imageInfo.tileWidth / 2,
                        // tileHeight: imageInfo.tileHeight /2,
                        tileWidth: imageInfo.tileWidth ,
                        tileHeight: imageInfo.tileHeight,
                        credentials: false
                    });

                    resolve(new RasterTileSetLayer(urlTileSetModel, {
                        label: layerName,
                        visible: true,
                        id: CARTESIAN_RASTER_LAYER_ID
                    }));
                });
        });
    }

    const setCRS1ImageLayer = (map: Map, layer: RasterTileSetLayer) =>  {
        // Fit on raster layer
        const bounds= layer.model!.bounds!;
        // map.mapNavigator.constraints.limitBounds = bounds;

        map.mapNavigator.constraints = {
            limitBounds: bounds,
            scale: {
                minScale: 1e-2,
                maxScale: 1
            }
        };
        const targetBounds = createBounds(bounds.reference, [bounds.x, 6000, bounds.y, bounds.height]);
        map.mapNavigator.fit({
            bounds: targetBounds
        });
        // Remove
        const layerImage = map.layerTree.findLayerById(CARTESIAN_RASTER_LAYER_ID);
        if (layerImage) {
            map.layerTree.removeChild(layerImage);
        }
        // Add the layer to the map
        const layerFeatures = map.layerTree.findLayerById(CARTESIAN_LAYER_FEATURES_ID);
        if (layerFeatures) {
            map.layerTree.addChild(layer, "below", layerFeatures);
        } else {
            map.layerTree.addChild(layer, "bottom");
        }
    }

    const formatter = {
        format: (point: Point): string => {
            return "(x:" + point.x.toFixed(0) + ", y:" + point.y.toFixed(0) + ")"
        }
    }

    return <div id={props.id} className={className} ref={divEl}>
        {props.children}
        {<MouseCoordinateReadout map={map.current} reference={crs1Reference} formatter={formatter} />}
    </div>
}

export {
    PortCartesianMap
}