import {Map} from "@luciad/ria/view/Map";
import {FeaturePainter, PaintState} from "@luciad/ria/view/feature/FeaturePainter";
import {GeoCanvas} from "@luciad/ria/view/style/GeoCanvas";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {Shape} from "@luciad/ria/shape/Shape";
import {Layer} from "@luciad/ria/view/Layer";
import {LabelCanvas} from "@luciad/ria/view/style/LabelCanvas";
import {OnPathLabelStyle} from "@luciad/ria/view/style/OnPathLabelStyle";

import texture from './moon_1k.jpg';
import {Icon3DStyle} from "@luciad/ria/view/style/Icon3DStyle";
import {create3DCylinder, create3DSphere, createVPlane} from "./simple3DMeshes/Simple3DMeshFactory";
import {Point} from "@luciad/ria/shape/Point";
import {Polyline} from "@luciad/ria/shape/Polyline";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {createEllipsoidalGeodesy} from "@luciad/ria/geodesy/GeodesyFactory";
import {createPoint} from "@luciad/ria/shape/ShapeFactory";

const styleSphereNormal = (radius: number) => ({
    mesh: create3DSphere(radius, 50, texture),
    color: 'rgba(255, 255, 255, 1)',
    rotation: {
        x: 0,
    },
} as Icon3DStyle );

const styleSphereSelected = (radius: number) => ({
    mesh: create3DSphere(radius, 50, texture),
    color: 'rgba(255, 0, 0, 1)',
    rotation: {
        x: 0,
    },
} as Icon3DStyle);

const styleVPlaneNormal = (radius: number, height: number) => ({
    mesh: createVPlane(radius, height, 2, texture),
    color: 'rgba(255, 255, 255, 1)',
    rotation: {
        x: 0,
    },
} as Icon3DStyle );

const styleVPlaneSelected = (radius: number, height: number) => ({
    mesh: createVPlane(radius, height, 2, texture),
    color: 'rgba(255, 0, 0, 1)',
    rotation: {
        x: 0,
    },
} as Icon3DStyle);

const DEFAULT_LINE_STYLE = {
    fill: {color: "rgba(0,128,255,0.5)", width: "5"},
    stroke: {color: "rgb(0,113,225)", width: 5, draped: false},
};

const SELECTED_LINE_STYLE = {
    fill: {color: "rgba(120,3,197,0.5)", width: "5"},
    stroke: {color: "rgb(153,0,255,0.5)", width: 5, draped: false},
};

class VOrthophotoPanelPainter extends FeaturePainter {
    private static pvShapeReference = getReference("CRS:84");
    private static pvGeodesy = createEllipsoidalGeodesy(VOrthophotoPanelPainter.pvShapeReference);

    constructor() {
        super();
    }

    paintBody(geoCanvas: GeoCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map, paintState: PaintState) {
        const line = shape as Polyline;
        const p0 = line.getPoint(0);
        const p1 = line.getPoint(1);
        const focusP = shape.focusPoint as Point
        const p =  createPoint(p0.reference, [focusP.x, focusP.y, focusP.z + 100])

        const height = (feature.properties.max - feature.properties.min) * 10;
        const radius = VOrthophotoPanelPainter.pvGeodesy.distance(p0, p1) / 2;
        const azimuth = VOrthophotoPanelPainter.pvGeodesy.forwardAzimuth(p0, p1) ;

        geoCanvas.drawShape(shape, paintState.selected ? SELECTED_LINE_STYLE : DEFAULT_LINE_STYLE );
      //  geoCanvas.drawIcon3D(p, paintState.selected ? styleSphereSelected(radius) : styleSphereNormal(radius));
        geoCanvas.drawIcon3D(shape.focusPoint as Point, paintState.selected ? styleVPlaneSelected(radius, height) : styleVPlaneNormal(radius,height));
    }

    paintLabel(labelCanvas: LabelCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map, paintState: PaintState) {
        const labelHTML = `<span style="font-size: 14px;color: white;text-shadow: 0.07em 0 black, 0 0.07em black, -0.07em 0 black, 0 -0.07em black;">${feature.properties.name}</span>`;
        labelCanvas.drawLabelOnPath(labelHTML, shape, {} as OnPathLabelStyle);
    }

}

export {
    VOrthophotoPanelPainter
}