import {ShapeProvider} from "@luciad/ria/view/feature/ShapeProvider";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {Shape} from "@luciad/ria/shape/Shape";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel";
import {Point} from "@luciad/ria/shape/Point";
import {createPoint, createPolygon, createPolyline} from "@luciad/ria/shape/ShapeFactory";
import {ShapeType} from "@luciad/ria/shape/ShapeType";
import {createEllipsoidalGeodesy} from "@luciad/ria/geodesy/GeodesyFactory";
import {CoordinateReference} from "@luciad/ria/reference/CoordinateReference";
import {Geodesy} from "@luciad/ria/geodesy/Geodesy";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {Polyline} from "@luciad/ria/shape/Polyline";
import {Polygon} from "@luciad/ria/shape/Polygon";

const crs1Reference = getReference("CRS:1");

interface ImageInfo {
    width:number;
    height:number;
    tileWidth:number;
    tileHeight:number;
    totalWidth:number;
    totalHeight:number;
    rows:number;
    columns:number;
    levelCount:number;
}

class VerticalFeaturesShapeProvider extends ShapeProvider {
    private model: FeatureModel;
    private imageInfo: ImageInfo;
    private p0: Point;
    private p1: Point;
    private p3: Point;
    private pvGeodesy: Geodesy;

    constructor(model: FeatureModel) {
        super();
        this.model = model;
        const p0 = (this.model as any).points[0] as Point;
        const p1 = (this.model as any).points[1] as Point;
        this.pvGeodesy = createEllipsoidalGeodesy(p0.reference as CoordinateReference);
        this.imageInfo = (this.model as any).imageInfo as ImageInfo;

        const alpha = this.pvGeodesy.forwardAzimuth(p0, p1) + 90;
        this.p0 = this.pvGeodesy.interpolate(p0, 0.05, alpha);
        this.p1 = this.pvGeodesy.interpolate(p1, 0.05, alpha);
        this.p3 = createPoint(this.p0.reference,[this.p1.x, this.p1.y, this.p0.z]);
        this.reference = this.p0.reference;
    }

    provideShape(feature: Feature): Shape | null {
        if (feature.shape) {
            switch (feature.shape.type) {
                case ShapeType.POINT:
                    return this.shiftedPoint(feature.shape);
                case ShapeType.POLYLINE:
                    return this.shiftedLine(feature.shape);
                case ShapeType.POLYGON:
                    return this.shiftedPolygon(feature.shape);
            }
        }
        return null;
    }

    private shiftOnePoint(point:Point) {
        if (point.reference && point.reference.equals(crs1Reference)) {
            const height = this.p1.z - this.p0.z;
            const translatedPoint= this.pvGeodesy.interpolate(this.p0, this.p3, point.x / this.imageInfo.width);
            const correctedHeight = height * (this.imageInfo.height-point.y) / this.imageInfo.height;
            return createPoint(this.p0.reference, [translatedPoint.x, translatedPoint.y, this.p0.z + correctedHeight ]);
        } else {
            return null
        }
    }

    private shiftedPoint(shape: Shape) {
        const point = shape as Point;
        return this.shiftOnePoint(point);
    }

    private shiftedLine(shape: Shape) {
        const line = shape as Polyline;
        const points = [] as Point[];
        for (let i = 0;  i< line.pointCount; ++i) {
            const point = line.getPoint(i);
            const ap = this.shiftOnePoint(point);
            if (ap) points.push(ap);
        }
        return createPolyline(this.p0.reference, points);
    }

    private shiftedPolygon(shape: Shape) {
        const line = shape as Polygon;
        const points = [] as Point[];
        for (let i = 0;  i< line.pointCount; ++i) {
            const point = line.getPoint(i);
            const ap = this.shiftOnePoint(point);
            if (ap) points.push(ap);
        }
        return createPolygon(this.p0.reference as CoordinateReference, points);
    }
}

export {
    VerticalFeaturesShapeProvider
}