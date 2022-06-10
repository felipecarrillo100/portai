import React, {useCallback, useEffect, useRef, useState} from "react";
import { SelectChangeEvent} from "@mui/material";
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
import {MemoryStore} from "@luciad/ria/model/store/MemoryStore";
import {GeoJsonCodec} from "@luciad/ria/model/codec/GeoJsonCodec";
// eslint-disable-next-line import/no-webpack-loader-syntax
// @ts-ignore
import {sampledata} from './sampledata';
import {boolean} from "@luciad/ria/util/expression/ExpressionFactory";
import {Feature} from "@luciad/ria/model/feature/Feature";

const geojsoncodec = new GeoJsonCodec({generateIDs:true});

interface Props extends FormProps {
    feature: Feature;
    type: string;
}


const CartesianMapForm = (props: Props) =>{
    const {closeForm} = props;

   const [layerVisibility,setLayerVisibility] = useState(true);

    const map = useRef<Map|null>(null);


    useEffect(()=>{
        // Init
        return ()=>{
            // Init
        }
    }, []);

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
            if (layer.restoreCommand && layer.restoreCommand.properties && layer.restoreCommand.properties.model && layer.restoreCommand.properties.model.defaultProperties){
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
                const store = (featureLayer.model as any).store as MemoryStore;
                store.clear();
            }
        }
    }

    const saveFeatures = () => {
        if (map.current) {
            const featureLayer = map.current?.layerTree.findLayerById(CARTESIAN_LAYER_FEATURES_ID) as FeatureLayer;
            if (featureLayer) {
                const store = (featureLayer.model as any).store as MemoryStore;
                const features = store.query();
                const text = geojsoncodec.encode(features);
                console.log(text);
            }
        }
    }

    const onMapChange = (aMap: Map) => {
        if (aMap && map.current !== aMap) {
            map.current = aMap;
            const featureLayer = map.current?.layerTree.findLayerById(CARTESIAN_LAYER_FEATURES_ID) as FeatureLayer;
            if (featureLayer && featureLayer.model) {
                const store = (featureLayer.model as any).store as MemoryStore;
                store.clear();
                const cursor = geojsoncodec.decode({content:sampledata, contentType: "application/json", reference: featureLayer.model.reference});
                while (cursor.hasNext()) {
                    const feature = cursor.next();
                    store.add(feature);
                    console.log(feature);
                }
            }
        }
    }

    const onVisibilityChange = (v: boolean) => {
        setLayerVisibility(v);
    }

    console.log("rerender");

    return (
        <div >
            <div style={{padding:5,left:0, right:0, bottom: 50, top: 0, position:"absolute", backgroundColor: "black"}}>
                <div style={{display: "inline"}}>
                    <Button color="primary" variant="outlined" onClick={addShape(ShapeType.POINT)}><ControlPointIcon /></Button>
                    <Button color="primary" variant="outlined" onClick={addShape(ShapeType.POLYLINE)}><PolylineIcon/></Button>
                    <Button color="primary" variant="outlined" onClick={addShape(ShapeType.POLYGON)}><PentagonIcon/></Button>
                </div>
                <div style={{display: "inline", float: "right"}}>
                    <Button variant="outlined" onClick={clearModel}>Clear all</Button>
                    <Button variant="outlined" onClick={saveFeatures}>Save</Button>
                    <Button variant={!layerVisibility ?"contained":"outlined"} onClick={toggleVisibility}>Hide Features</Button>
                </div>
            </div>
            <div style={{left:0, right:0, bottom: 0, top: 50, position: "absolute"}}>
                <CartesianMap featureID="1" onMapChange={onMapChange} onVisibilityChange={onVisibilityChange} feature={props.feature} type={props.type}/>
            </div>
        </div>
    )
};

export {
    CartesianMapForm
}