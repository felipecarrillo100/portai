import {Map} from "@luciad/ria/view/Map";
import React from "react";
import {ContinuousActionTrigger} from "./ContinuousActionTrigger";
import "./ZoomControlMini.scss";

function zoomIn(map: Map) {
    map?.mapNavigator.zoom({
        factor: 2,
        animate: {
            duration: 250
        }
    });
}

function zoomOut(map: Map) {
    //#snippet zoomout
    //#description use the mapNavigator to zoom
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
}

export {
    ZoomControlMini
}