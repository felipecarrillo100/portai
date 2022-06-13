import {Map} from "@luciad/ria/view/Map";
import {ShapeType} from "@luciad/ria/shape/ShapeType";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {DefaultMapController} from "../../../components/luciad/controllers/DefaultMapController";

import {AdvanceLayerTools} from "../../../components/luciad/layerutils/AdvanceLayerTools";
import CreateFeatureInLayerController from "../../../components/luciad/controllers/CreateFeatureInLayerController";
import Button from "@mui/material/Button";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import PolylineIcon from "@mui/icons-material/Polyline";
import PentagonIcon from "@mui/icons-material/Pentagon";
import React from "react";
import {Divider} from "@mui/material";

interface Props {
    map: Map | null;
    currentLayerId: string | null;
}

const EditTools: React.FC<Props> = (props:Props) => {

    const { map, currentLayerId } = props;

    const addShape = (shapeType: ShapeType) => (event: any) =>{
        if (map) {
            const promiseToLayer = getDrawLayer(map);
            promiseToLayer.then((layer)=>{
                const createController = createShapeController(layer, shapeType);
                if (map) {
                    map.controller = createController;
                }
            }, ()=>{});
        }
    }

    const getCurrentLayer = () => {
        if (map && currentLayerId) {
            return AdvanceLayerTools.getLayerTreeNodeByID(map, currentLayerId);
        } else return null;
    }

    const getDrawLayer = (map: Map) => {
        return new Promise<FeatureLayer>((resolve, reject)=>{
            const layer = getCurrentLayer();
            if (layer !== null && AdvanceLayerTools.isEditable(layer)) {
                resolve(layer as FeatureLayer);
            } else {
              //  const annotationsLayerPromise = this.createAnnotationsLayer(options);
              //  annotationsLayerPromise.then(annotationLayer=>resolve(annotationLayer), reason => reject(reason));
                reject();
            }
        })
    }

    const createShapeController = (layerInput: FeatureLayer, shapeType: ShapeType) => {
        if (map && layerInput) {
            const layer = layerInput as any;
            let defaultProperties = {};
            map.selectObjects([]);
            if (layer.restoreCommand && layer.restoreCommand.properties && layer.restoreCommand.properties.model && layer.restoreCommand.properties.model.defaultProperties){
                defaultProperties = JSON.parse(layer.restoreCommand.properties.model.defaultProperties);
            }
            const createController = new CreateFeatureInLayerController(shapeType, defaultProperties, layer, DefaultMapController.getDefaultMapController() );
            return createController;
        } else {
            return DefaultMapController.getDefaultMapController() ;
        }
    }

    return (
        <>
            <Divider sx={{marginTop:1}}>Edit</Divider>
            <Button color="primary" variant="outlined" onClick={addShape(ShapeType.POINT)}><ControlPointIcon /></Button>
            <Button color="primary" variant="outlined" onClick={addShape(ShapeType.POLYLINE)}><PolylineIcon/></Button>
            <Button color="primary" variant="outlined" onClick={addShape(ShapeType.POLYGON)}><PentagonIcon/></Button>
        </>
    )
}

export {
    EditTools
}