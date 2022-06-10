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

interface Props {
    onVisibilityChange?: (v: boolean) => void;
    onMapChange?: (map: Map) => void;
    featureID: string;
    className?: string;
    id?: string;
    feature: Feature;
    type: string;
}

interface StateProps {
    mainMap: Map | null;
}

export const CARTESIAN_RASTER_LAYER_ID = "raster-layer-id";
export const CARTESIAN_LAYER_FEATURES_ID = "features-layer-id";
const crs1Reference = getReference("CRS:1");


const CartesianMap: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {
    const divEl = useRef(null);
    const map = useRef(null as Map | null);
    const className = "CartesianMap"+ (typeof props.className !== "undefined" ? " " + props.className : "");

    const { mainMap } = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            mainMap: state.luciadMap.map,
        }
    });

    const initializeMap = (map: Map) => {
        createRasterlayer(map);
        createFeatureLayer(map);
        if (typeof props.onMapChange === "function") props.onMapChange(map);
    }

    const createFeatureLayer = (map: Map) => {
        const createAnnotationsLayer = () =>{
            const featureStore = new MemoryStore();
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

    const createRasterlayer = (map: Map) => {
        const photo = props.feature.properties.photo;
      //  const fileOrFileName = `http://localhost/ortho/?filename=${photo}`;
        let fileOrFileName = `http://localhost/ortho/?filename=${photo}`;
        switch (props.type) {
            case "tiff":
                fileOrFileName = `http://localhost/ortho/?filename=${photo}`;
                break;
            case "drone":
                fileOrFileName = `http://localhost/drone/?filename=${photo}`;
                break;
        }

       // const fileOrFileName = "http://localhost/ortho/?filename=GEOTIFF_Orthofoto_Hachmannkai_Sued_1.tif";
        //  const fileOrFileName = "http://localhost/ortho/?filename=GEOTIFF_Orthofoto_Rollbo.tif";

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



    const createLayer = (layerName: string, fileOrURL: string, reference: CoordinateReference): Promise<RasterTileSetLayer> => {
        return new Promise((resolve, reject) => {
            fetch(fileOrURL+"&service=GetInfo")
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
                        tileWidth: imageInfo.tileWidth / 2,
                        tileHeight: imageInfo.tileHeight /2,
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
    CartesianMap
}