import React, {useEffect, useState} from "react";
import {Map} from "@luciad/ria/view/Map";

import "./CartesianNavigationHelper.scss"
import {Feature} from "@luciad/ria/model/feature/Feature";
import {createPoint} from "@luciad/ria/shape/ShapeFactory";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";

interface Props {
    layer: FeatureLayer;
    map: Map | null;
    feature: Feature | null;
}

const crs1Reference = getReference("CRS:1");

const CartesianNavigationHelper: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {

    const [bounds, setBounds] = useState([0,1,0,1]);
    const [mapBounds, setMapBounds] = useState([0,1,0,1]);
    const [ratio, setRatio] = useState(100);
    const [thumbImage, setThumbImage] = useState("");

    useEffect(()=>{
        if (props.map) {
            initNewMap(props.map)
        }
    }, [props.map]);

    useEffect(()=>{
        if (props.feature ) {
            initNewFeature(props.feature);
            loadImageDetails();
        }
    }, [props.feature]);

    const loadImageDetails = () => {
        const fileOrURL = getFilename();
        setThumbImage(fileOrURL+"?service=GetThumb");
        fetch(fileOrURL+"?service=GetInfo")
            .then(response => {
                return response.json();
            })
            .then(imageInfo => {
                const ratio = imageInfo.width / imageInfo.totalWidth * 100;
                setRatio(ratio)
                })
    }

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

    const getFilename = () => {
        let fileOrFileName = "";
        const store = props.layer.model.store as any;
        const url = store.url;
        const baseUrl = url.substring(0, url.lastIndexOf("/"));
        const image = (props.feature as any).properties.image;
        fileOrFileName = `${baseUrl}${image}`;
        return fileOrFileName;
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
            <img src={thumbImage} width="100%" height="100%" style={{width: ""+ratio+"%"}}/>
            <div className="indicator" style={{left: (bounds[0]*100)+"%", width:(bounds[1]*100)+"%", top: (bounds[2]*100)+"%", height: (bounds[3]*90)+"%" }}  />
        </div>)
}

export {
    CartesianNavigationHelper
}