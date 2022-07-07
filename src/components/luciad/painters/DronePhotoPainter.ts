import {Map} from "@luciad/ria/view/Map";
import {FeaturePainter, PaintState} from "@luciad/ria/view/feature/FeaturePainter";
import {GeoCanvas} from "@luciad/ria/view/style/GeoCanvas";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {Shape} from "@luciad/ria/shape/Shape";
import {Layer} from "@luciad/ria/view/Layer";
import {LabelCanvas} from "@luciad/ria/view/style/LabelCanvas";

import {ShapeType} from "@luciad/ria/shape/ShapeType";
import {IconStyle} from "@luciad/ria/view/style/IconStyle";

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

class DronePhotoPainter extends FeaturePainter {


    paintBody(geoCanvas: GeoCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map, paintState: PaintState) {
        if (feature.shape) {
            if (feature.shape?.type === ShapeType.POINT) {
                geoCanvas.drawIcon(feature.shape, paintState.selected ? selectedIconStyle: normalIconStyle);
            }
        }
    }

    paintLabel(labelCanvas: LabelCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map, paintState: PaintState) {
        const labelHTML = `<span style="font-size: 14px;color: white;text-shadow: 0.07em 0 black, 0 0.07em black, -0.07em 0 black, 0 -0.07em black;">${feature.properties.name }</span>`;
        labelCanvas.drawLabel(labelHTML, shape, {} );
    }

}

export {
    DronePhotoPainter
}