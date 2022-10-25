import React, {useEffect, useState} from "react";
import {Map} from "@luciad/ria/view/Map";

import "./CartesianNavigationHelper.scss"
import {Feature} from "@luciad/ria/model/feature/Feature";
import {createPoint} from "@luciad/ria/shape/ShapeFactory";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";

interface Props {
    map: Map | null;
    feature: Feature | null;
}

const crs1Reference = getReference("CRS:1");

const CartesianNavigationHelper: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {

    const [bounds, setBounds] = useState([0,1,0,1]);
    const [mapBounds, setMapBounds] = useState([0,1,0,1]);

    useEffect(()=>{
        if (props.map) {
            initNewMap(props.map)
        }
    }, [props.map]);

    useEffect(()=>{
        if (props.feature ) {
            initNewFeature(props.feature)
        }
    }, [props.feature]);

    const initNewMap = (map:Map) =>{
        map.on("MapChange", ()=>{
            if (map.mapNavigator.constraints.limitBounds && map.mapNavigator.constraints.limitBounds.bounds) {
                const width = map.mapNavigator.constraints.limitBounds.bounds.width;
                const height = map.mapNavigator.constraints.limitBounds.bounds.height;
                setBounds([map.mapBounds.x/width, map.mapBounds.width/width, map.mapBounds.y/height, map.mapBounds.height/height]);
            }
        })
    }

    const initNewFeature = (feature:Feature) =>{
        if (feature.shape) {
            const featureBounds = feature.shape.bounds;
            if (featureBounds) setMapBounds([featureBounds.x, featureBounds.width, featureBounds.y, featureBounds.height]);
        }
    }

    const onClick = (event: any) => {
        if (props.map) {
            const map = props.map;
            const rect = event.target.getBoundingClientRect()
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            if (map.mapNavigator.constraints.limitBounds && map.mapNavigator.constraints.limitBounds.bounds) {
                const width = map.mapNavigator.constraints.limitBounds.bounds.width;
                const height = map.mapNavigator.constraints.limitBounds.bounds.height;
                const targetX = width * x;
                const targetY = height * y;
                const targetPoint = createPoint(crs1Reference, [targetX, targetY]);
                map.mapNavigator.pan({targetLocation: targetPoint, animate:{duration: 200}})
            }
        }
    }

    return (
        <div className="CartesianNavigationHelper" onClick={onClick}>
            <div className="indicator" style={{left: (bounds[0]*100)+"%", width:(bounds[1]*100)+"%", top: (bounds[2]*100)+"%", height: (bounds[3]*90)+"%" }}  />
        </div>)
}

export {
    CartesianNavigationHelper
}