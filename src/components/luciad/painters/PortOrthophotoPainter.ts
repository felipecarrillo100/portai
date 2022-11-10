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
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {createEllipsoidalGeodesy} from "@luciad/ria/geodesy/GeodesyFactory";
import {ShapeType} from "@luciad/ria/shape/ShapeType";
import {IconStyle} from "@luciad/ria/view/style/IconStyle";
import {ShapeList} from "@luciad/ria/shape/ShapeList";
import {Point} from "@luciad/ria/shape/Point";
import {LineType} from "@luciad/ria/geodesy/LineType";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";

const styleVPlaneNormal = (width: number, height: number, rotation: number, filename: string) => {
    const texture = document.createElement('img');
    texture.crossOrigin = "Anonymous";
    texture.src = filename;
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
    texture.src = filename;
    return ({
        mesh: createVPlane(width, height, texture),
        color: 'rgba(255, 0, 0, 1)',
        rotation: {
            z: rotation ,
        },
    } as Icon3DStyle);
}

const normalIconStyle: IconStyle = {
    url: "images/drone480_blue.png",
    draped: false,
    anchorY: "50%",
    width: "36px",
    height: "36px",
    opacity: 1
}

const selectedIconStyle: IconStyle = {
    url: "images/drone480_red.png",
    draped: false,
    anchorY: "50%",
    width: "36px",
    height: "36px",
    opacity: 1
}

const DEFAULT_LINE_STYLE = {
    fill: {color: "rgba(0,128,255,0.5)", width: "5"},
    stroke: {color: "rgb(0,113,225)", width: 5, draped: false},
};

const SELECTED_LINE_STYLE = {
    fill: {color: "rgba(120,3,197,0.5)", width: "5"},
    stroke: {color: "rgb(153,0,255,0.5)", width: 5, draped: false},
};

class PortOrthophotoPainter extends FeaturePainter {
    private static pvShapeReference = getReference("CRS:84");
    private static pvGeodesy = createEllipsoidalGeodesy(PortOrthophotoPainter.pvShapeReference);

    constructor() {
        super();
    }

    paintBody(geoCanvas: GeoCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map, paintState: PaintState) {
        if (shape && shape.type === ShapeType.SHAPE_LIST && (shape as ShapeList).shapeCount === 2 ) {
            const list = shape as ShapeList;
            const p0 = list.getShape(0) as Point;
            const p1 = list.getShape(1) as Point;
            const p3 = list.getShape(1).copy() as Point;
            if (p0.z < p1.z) {
                p3.z = p0.z;
            }
            const azimuth = PortOrthophotoPainter.pvGeodesy.forwardAzimuth(p0, p3);
            const distance = PortOrthophotoPainter.pvGeodesy.distance(p0, p3, LineType.SHORTEST_DISTANCE);
            const middle = PortOrthophotoPainter.pvGeodesy.interpolate(p0, p1, 0.5, LineType.SHORTEST_DISTANCE)
          //  geoCanvas.drawIcon(p0, paintState.selected ? selectedIconStyle: normalIconStyle);
            //geoCanvas.drawIcon(p1, paintState.selected ? selectedIconStyle: normalIconStyle);

            let meshStyle;
            if (feature.properties._meshstyle) {
                meshStyle = feature.properties._meshstyle
            } else {
                const store = (layer as FeatureLayer ).model.store;
                const url = (store as any).url;
                const baseUrl = url.substring(0, url.lastIndexOf("/"));

                const image = baseUrl + feature.properties.image
                const height = (p1.z - p0.z) ;
                const width = distance;
                feature.properties._meshstyle = {
                    normal: styleVPlaneNormal(width, height, 90 - azimuth, image ),
                    selected: styleVPlaneSelected(width, height, 90 - azimuth, image)
                }
                meshStyle = feature.properties._meshstyle
            }
            geoCanvas.drawIcon3D(middle, paintState.selected ?  meshStyle.selected : meshStyle.normal) ;
        }
    }

    paintLabel(labelCanvas: LabelCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map, paintState: PaintState) {
        const labelHTML = `<span style="font-size: 14px;color: white;text-shadow: 0.07em 0 black, 0 0.07em black, -0.07em 0 black, 0 -0.07em black;">${feature.properties.image }</span>`;
        labelCanvas.drawLabelOnPath(labelHTML, shape, {} as OnPathLabelStyle);
    }

}

export {
    PortOrthophotoPainter
}