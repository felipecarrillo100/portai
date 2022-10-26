import {FeaturePainter, PaintState} from "@luciad/ria/view/feature/FeaturePainter";
import {GeoCanvas} from "@luciad/ria/view/style/GeoCanvas";
import {LabelCanvas} from "@luciad/ria/view/style/LabelCanvas";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {Shape} from "@luciad/ria/shape/Shape";
import {Layer} from "@luciad/ria/view/Layer";
import {Map} from "@luciad/ria/view/Map";
import {ShapeType} from "@luciad/ria/shape/ShapeType";
import {ShapeStyle} from "@luciad/ria/view/style/ShapeStyle";
import {LabelStyle} from "@luciad/ria/view/style/LabelStyle";
import {IconStyle, ImageIconStyle} from "@luciad/ria/view/style/IconStyle";
import IconProvider, {IconProviderShapes} from "../iconimagefactory/IconProvider";

const normalStyle:ShapeStyle = {
    stroke: {
        color: "rgba(255,0,0, 1)",
        width: 2
    },
    fill: {
        color: "rgba(255,0,0, 0.5)"
    }
}

const selectedStyle:ShapeStyle = {
    stroke: {
        color: "rgba(0,255,0, 1)",
        width: 2
    },
    fill: {
        color: "rgba(0,255,0, 0.5)"
    }
}

const normalIconStyle: IconStyle = {
    image: IconProvider.paintIconByName(IconProviderShapes.CIRCLE, {
        fill: "rgba(255,0,0, 0.5)",
        height: 16,
        stroke: "rgba(255,0,0, 1)",
        width: 16,
        strokeWidth:2,
    })
}

const selectedIconStyle: IconStyle = {
    image: IconProvider.paintIconByName(IconProviderShapes.CIRCLE, {
        fill:  "rgba(0,255,0, 0.5)",
        height: 20,
        stroke: "rgba(0,255,0, 1)",
        width: 16,
        strokeWidth:2,
    })
}
class CartesianAnnotationsPainter extends FeaturePainter {
    paintBody(geoCanvas: GeoCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map, paintState: PaintState) {
        if (shape) {
            if (shape?.type === ShapeType.POINT) {
                geoCanvas.drawIcon(shape, paintState.selected ? selectedIconStyle: normalIconStyle);
            } else {
                geoCanvas.drawShape(shape, paintState.selected ? selectedStyle: normalStyle);
            }
        }
    }
    paintLabel(labelCanvas: LabelCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map, paintState: PaintState) {
        if (feature.shape) {
            const label = feature.properties.name;
            const template = `<span style="color:white; text-shadow: 1px 1px 2px black, 0 0 1px black, 0 0 0.2px black;">${label}</span>`;
            if (shape.type === ShapeType.POINT) {
                labelCanvas.drawLabel(template, shape, {} as LabelStyle);
            } else
            if (shape.type === ShapeType.POLYGON)
            {
                labelCanvas.drawLabelInPath(template, shape, {} as LabelStyle);
            } else {
                labelCanvas.drawLabelOnPath(template, shape, {} as LabelStyle);
            }
        }
    }
}

export {
    CartesianAnnotationsPainter
}