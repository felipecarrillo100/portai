import React, { useRef, useState} from "react";
import {Map} from "@luciad/ria/view/Map";
import Button from "@mui/material/Button";
import {FormProps} from "../interfaces";
import {CARTESIAN_LAYER_FEATURES_ID, CartesianMap} from "../../components/luciad/cartesianmap/CartesianMap";
import {ShapeType} from "@luciad/ria/shape/ShapeType";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import CreateFeatureInLayerController from "../../components/luciad/controllers/CreateFeatureInLayerController";

import ControlPointIcon from '@mui/icons-material/ControlPoint';
import PolylineIcon from '@mui/icons-material/Polyline';
import PentagonIcon from '@mui/icons-material/Pentagon';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

import {GeoJsonCodec} from "@luciad/ria/model/codec/GeoJsonCodec";
// eslint-disable-next-line import/no-webpack-loader-syntax
// @ts-ignore
import {sampledata} from './sampledata';
import {Feature} from "@luciad/ria/model/feature/Feature";
import {PortCartesianMap} from "../../components/luciad/cartesianmap/PortCartesianMap";
import {FeaturesRestAPIStore} from "../../components/luciad/stores/FeaturesRestAPIStore";
import {CartesianNavigationHelper} from "../../components/luciad/cartesianmap/CartesianNavigationHelper";
import {FullScreen} from "../../utils/fullscreen/FullScreen";

const geojsoncodec = new GeoJsonCodec({generateIDs:true});

interface Props extends FormProps {
    layer: FeatureLayer;
    feature: Feature;
    type: string;
    initialRatio: number;
}


const PortCartesianMapForm = (props: Props) =>{
    const formAnchorRef = useRef<HTMLDivElement>(null);
    const [layerVisibility,setLayerVisibility] = useState(true);
    const [linkedMap,setLinkedMap] = useState(null as Map | null);

    const map = useRef<Map|null>(null);

    const toggleScreen = () => {
        if (formAnchorRef.current) {
            const fullScreen = !FullScreen.isFullscreen();
            fullScreen ? FullScreen.requestFullscreen(formAnchorRef.current) : FullScreen.cancelFullscreen();
        }
    }

    const addShape = (shapeType: ShapeType) => (event: any) =>{
        if (map.current) {
            const featureLayer = map.current?.layerTree.findLayerById(CARTESIAN_LAYER_FEATURES_ID) as FeatureLayer;
            if (featureLayer) {
                const createController = createShapeController(featureLayer, shapeType, {name: "New Feature", description: ""});
                if (map) {
                    map.current.controller = createController;
                }
            }
        }
    }

    const createShapeController = (layerInput: FeatureLayer, shapeType: ShapeType, properties?: {[key: string]: any}) => {
        if (map.current && layerInput) {
            const layer = layerInput as any;
            let defaultProperties = properties ? {...properties} : {};
            map.current.selectObjects([]);
            if (layer.restoreCommand && layer.restoreCommand.properties && layer.restoreCommand.properties.model && layer.restoreCommand.properties.model.defaultProperties) {
                defaultProperties = JSON.parse(layer.restoreCommand.properties.model.defaultProperties);
            }
            const createController = new CreateFeatureInLayerController(shapeType, defaultProperties, layer, null );
            return createController;
        } else {
            return null;
        }
    }

    const toggleVisibility = ()=>{
        if (map.current) {
            const featureLayer = map.current.layerTree.findLayerById(CARTESIAN_LAYER_FEATURES_ID) as FeatureLayer;
            if (featureLayer) {
                const visible = !featureLayer.visible;
                featureLayer.visible = visible;
            }
        }
    }

    const clearModel = () => {
        if (map.current) {
            const featureLayer = map.current?.layerTree.findLayerById(CARTESIAN_LAYER_FEATURES_ID) as FeatureLayer;
            if (featureLayer) {
                const store = (featureLayer.model as any).store as FeaturesRestAPIStore;
                store.clear();
            }
        }
    }

    const saveFeatures = () => {
        if (map.current) {
            const featureLayer = map.current?.layerTree.findLayerById(CARTESIAN_LAYER_FEATURES_ID) as FeatureLayer;
            if (featureLayer) {
                const store = (featureLayer.model as any).store as FeaturesRestAPIStore;
                 store.query().then((features:any)=>{
                    const text = geojsoncodec.encode(features);
                    console.log(text);
                });

                store.get(1).then((feature)=>{
                    console.log(feature)
                })
            }
        }
    }

    const onVisibilityChange = (v: boolean) => {
        setLayerVisibility(v);
    }

    const setCurrentMap = (aMap:Map) => {
        map.current = aMap
        setLinkedMap(aMap);
    }


    return (
        <div ref={formAnchorRef}>
            <Button color="primary" variant="outlined" onClick={addShape(ShapeType.POINT)}><ControlPointIcon /></Button>
            <Button color="primary" variant="outlined" onClick={addShape(ShapeType.POLYLINE)}><PolylineIcon/></Button>
            <Button color="primary" variant="outlined" onClick={addShape(ShapeType.POLYGON)}><PentagonIcon/></Button>
            <div style={{padding:5,left:0, right:0, bottom: 50, top: 0, position:"absolute", backgroundColor: "black"}}>
                <div style={{display: "inline"}}>
                    <Button color="primary" variant="outlined" onClick={addShape(ShapeType.POINT)}><ControlPointIcon /></Button>
                    <Button color="primary" variant="outlined" onClick={addShape(ShapeType.POLYLINE)}><PolylineIcon/></Button>
                    <Button color="primary" variant="outlined" onClick={addShape(ShapeType.POLYGON)}><PentagonIcon/></Button>
                </div>
                <div style={{display: "inline", float: "right", marginLeft:10}}>
                    <Button color="primary" variant="outlined" onClick={toggleScreen}><FullscreenIcon/></Button>
                </div>
                <div style={{display: "inline", float: "right"}}>
                    <Button variant="outlined" onClick={clearModel}>Clear all</Button>
                    <Button variant="outlined" onClick={saveFeatures}>Save</Button>
                    <Button variant={!layerVisibility ?"contained":"outlined"} onClick={toggleVisibility}>Hide Features</Button>
                </div>
            </div>
            <div style={{left:0, right:0, bottom: 50, top: 50, position: "absolute"}}>
                <PortCartesianMap layer={props.layer}
                                  onVisibilityChange={onVisibilityChange}
                                  feature={props.feature} type={props.type}
                                  setMap={setCurrentMap}
                                  initialPosition={[props.initialRatio, 0.5]}
                />
            </div>
            <div style={{left:0, right:0, bottom: 0, height: 50, position: "absolute"}}>
                <CartesianNavigationHelper map={linkedMap} layer={props.layer} feature={props.feature}/>
            </div>
        </div>
    )
};

export {
    PortCartesianMapForm
}