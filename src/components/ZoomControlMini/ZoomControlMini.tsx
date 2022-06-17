import {Map} from "@luciad/ria/view/Map";
import React from "react";
import {ContinuousActionTrigger} from "./ContinuousActionTrigger";
import "./ZoomControlMini.scss";
import {PanoramaActions} from "../luciad/controllers/actions/PanoramaActions";

function zoomIn(map: Map) {
    if (map && (map as any)._myPanoramaActions) {
        const panoActions = (map as any)._myPanoramaActions as PanoramaActions;
        if (panoActions.isInPanoramaMode()) {
            panoActions.leavePanoramaMode();
        }
    }
    map?.mapNavigator.zoom({
        factor: 2,
        animate: {
            duration: 250
        }
    });
}

function zoomOut(map: Map) {
    if (map && (map as any)._myPanoramaActions) {
        const panoActions = (map as any)._myPanoramaActions as PanoramaActions;
        if (panoActions.isInPanoramaMode()) {
            panoActions.leavePanoramaMode();
        }
    }
    map?.mapNavigator.zoom({
        factor: 0.5,
        animate: {
            duration: 250
        }
    });
    //#endsnippet zoomout
}

interface Props {
    map: Map | null;
}

const ZoomControlMini = ({map}: Props) => {
    if (map) {
        return (
            <div className="ZoomControlMini">
                <ContinuousActionTrigger action={() => zoomIn(map as Map)}>
                    <div className="zoom-control-button round-border-top" >+</div>
                </ContinuousActionTrigger>
                <ContinuousActionTrigger action={() => zoomOut(map as Map)}>
                    <div className="zoom-control-button round-border-bottom" >-</div>
                </ContinuousActionTrigger>
            </div>
        );
    } else {
        return (<></>)
    }
}

export {
    ZoomControlMini
}