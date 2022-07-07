import {Map} from "@luciad/ria/view/Map";
import {FeaturePainter, PaintState} from "@luciad/ria/view/feature/FeaturePainter";
import {GeoCanvas} from "@luciad/ria/view/style/GeoCanvas";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {Shape} from "@luciad/ria/shape/Shape";
import {Layer} from "@luciad/ria/view/Layer";
import {LabelCanvas} from "@luciad/ria/view/style/LabelCanvas";
import {OnPathLabelStyle} from "@luciad/ria/view/style/OnPathLabelStyle";

import {Icon3DStyle} from "@luciad/ria/view/style/Icon3DStyle";
import {createVPlane} from "./simple3DMeshes/Simple3DMeshFactory";
import {Polyline} from "@luciad/ria/shape/Polyline";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {createEllipsoidalGeodesy} from "@luciad/ria/geodesy/GeodesyFactory";
import {createPoint, createPolyline} from "@luciad/ria/shape/ShapeFactory";
import {LineType} from "@luciad/ria/geodesy/LineType";

const styleVPlaneNormal = (width: number, height: number, rotation: number, filename: string) => {
    const texture = document.createElement('img');
    texture.crossOrigin = "Anonymous";
   // texture.src = `http://localhost/ortho/?filename=${filename}&service=GetThumb`;
    texture.src = `/tiff/?filename=${filename}&service=GetThumb`;
    return ({
        mesh: createVPlane(width, height, texture),
        color: 'rgba(255, 255, 255, 1)',
        rotation: {
            z: rotation,
        },
    } as Icon3DStyle);
}

const styleVPlaneSelected = (width: number, height: number, rotation: number, filename: string) => {
    const texture = document.createElement('img');
    texture.crossOrigin = "Anonymous";
    // texture.src = `http://localhost/ortho/?filename=${filename}&service=GetThumb`;
    texture.src = `/tiff/?filename=${filename}&service=GetThumb`;
    return ({
        mesh: createVPlane(width, height, texture),
        color: 'rgba(255, 0, 0, 1)',
        rotation: {
            z: rotation ,
        },
    } as Icon3DStyle);
}

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
        const azimuth = VOrthophotoPanelPainter.pvGeodesy.forwardAzimuth(p0, p1);
        const distance = VOrthophotoPanelPainter.pvGeodesy.distance(p0, p1, LineType.SHORTEST_DISTANCE);
        const middle = VOrthophotoPanelPainter.pvGeodesy.interpolate(p0, distance/2, azimuth, LineType.SHORTEST_DISTANCE)

        const p =  createPoint(p0.reference, [middle.x, middle.y, middle.z + 100]);

        let meshStyle;
        if (feature.properties._meshstyle) {
            meshStyle = feature.properties._meshstyle
        } else {
            const height = (feature.properties.max - feature.properties.min) ;
            const width = distance;
            feature.properties._meshstyle = {
                normal: styleVPlaneNormal(width,height, 270 - azimuth, feature.properties.photo ),
                selected: styleVPlaneSelected(width, height, 270 - azimuth, feature.properties.photo)
            }
            meshStyle = feature.properties._meshstyle
        }

        const p3 = VOrthophotoPanelPainter.pvGeodesy.interpolate(middle, distance, azimuth - 90, LineType.SHORTEST_DISTANCE);
        const Line2 = createPolyline(line.reference, [middle, p3]);

        geoCanvas.drawShape(shape, paintState.selected ? SELECTED_LINE_STYLE : DEFAULT_LINE_STYLE );
      //  geoCanvas.drawShape(Line2, paintState.selected ? SELECTED_LINE_STYLE : DEFAULT_LINE_STYLE );
        geoCanvas.drawIcon3D(middle, paintState.selected ?  meshStyle.selected : meshStyle.normal) ;
    }

    paintLabel(labelCanvas: LabelCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map, paintState: PaintState) {
        const line = shape as Polyline;
        const p0 = line.getPoint(0);
        const p1 = line.getPoint(1);
        const azimuth = VOrthophotoPanelPainter.pvGeodesy.forwardAzimuth(p0, p1);
        const labelHTML = `<span style="font-size: 14px;color: white;text-shadow: 0.07em 0 black, 0 0.07em black, -0.07em 0 black, 0 -0.07em black;">${feature.properties.name }</span>`;
        labelCanvas.drawLabelOnPath(labelHTML, shape, {} as OnPathLabelStyle);
    }

}

export {
    VOrthophotoPanelPainter
}