import * as GeodesyFactory from "@luciad/ria/geodesy/GeodesyFactory";
import * as ReferenceProvider from "@luciad/ria/reference/ReferenceProvider";
import { Controller } from "@luciad/ria/view/controller/Controller";
import {EVENT_IGNORED, HandleEventResult} from "@luciad/ria/view/controller/HandleEventResult";
import { GestureEventType } from "@luciad/ria/view/input/GestureEventType";
import { Map } from "@luciad/ria/view/Map";
import { GeoCanvas } from "@luciad/ria/view/style/GeoCanvas";
import { LabelCanvas } from "@luciad/ria/view/style/LabelCanvas";
import { GestureEvent } from "@luciad/ria/view/input/GestureEvent";
import {LocationMode} from "@luciad/ria/transformation/LocationMode";

// import { LocationMode } from "@luciad/ria/transformation/LocationMode";
// const LocationMode = LocationModeSt as any;

import * as TransformationFactory from "@luciad/ria/transformation/TransformationFactory";

import Measurement from "./Measurement";
import Ruler3DPresentation from "./Ruler3DPresentation";
import {EventedSupport} from "@luciad/ria/util/EventedSupport";
import FormatUtil from "../utils/FormatUtil";

const SQUARED_SLACK = 100; //some slack when clicking.

export interface Ruler3DUpdateValues {
    area: number;
    distance: number;
    areaText: string;
    distanceText: string;
}

export enum Ruler3DControllerTypes {
    MEASURE_TYPE_AREA = "area",
    MEASURE_TYPE_DISTANCE = "distance",
    MEASURE_TYPE_ORTHO = "orthogonal",
    MEASURE_TYPE_HEIGHT = "height",
}
enum MEASURE_TYPE {
    MEASURE_TYPE_PARAM = "measureType",
}

/**
 * Creates the Ruler Controller instance.
 * @constructor
 */
class Ruler3DController extends Controller {
    // RESULTS PRESENTATION
    public static MEASUREMENT_CHANGED = "MEASUREMENT_CHANGED";
    public static MEASUREMENT_DEACTIVATED = "MEASUREMENT_DEACTIVATED";
   // public static MEASURE_TYPE_PARAM = "measureType";

 //   private _measureResult: null;
    private _measureOptions: {};
    private _wait: boolean;
    private _dx: number | null | undefined;
    private _dy: number | null | undefined;
    private _suspended: boolean;
    private _measurement: Measurement | undefined;
    private _presentation: Ruler3DPresentation | undefined;
    private _eventSupport: EventedSupport;

    constructor(options?: any) {
        super();
      // private properties
 //     this._measureResult = null;
      this._measureOptions = {};

      this._wait = false;
      this._dx = null;
      this._dy = null;
      this._eventSupport = new EventedSupport([Ruler3DController.MEASUREMENT_CHANGED, Ruler3DController.MEASUREMENT_DEACTIVATED], true);

      options = options || {};
      this.setMeasureOptions(MEASURE_TYPE.MEASURE_TYPE_PARAM, options[MEASURE_TYPE.MEASURE_TYPE_PARAM] || Ruler3DControllerTypes.MEASURE_TYPE_DISTANCE);
      this._suspended = false;
  }

    public get formatUtil(): FormatUtil {
        return (this._presentation as Ruler3DPresentation).formatUtil;
    }

    public set formatUtil(value: FormatUtil) {
        (this._presentation as Ruler3DPresentation).formatUtil = value;
        this.invalidate();
    }

    get segments(): any[] {
        return (this._measurement as Measurement).segments;
    }

    get totals(): any[] {
        return (this._presentation as Ruler3DPresentation).getTotals((this._measurement as Measurement).segments);
    }

    public getMeasurements =  () => {
        const segments = this._measurement?.segments;
        return {
            segments,
            totals: this._presentation?.getTotals(segments)
        };
    };

    /**
     * Called when the controller becomes active. Perform any setup here.
     */
    public onActivate (map: Map) {
        this.init(map);
        super.onActivate(map)
    }

    /**
     * called when the controller becomes inactive
     * perform any cleanup here.
     */
    public onDeactivate(map: Map) {
        this._measurement?.reset();
        super.onDeactivate(map);
        // this.emit(Ruler3DController.MEASUREMENT_DEACTIVATED, undefined);
        // Controller implements Evented - inform listeners that measure results changed
        this._eventSupport.emit(Ruler3DController.MEASUREMENT_DEACTIVATED);
    }

    onMeasurementChange = (callback: any) => {
        this._eventSupport.on(Ruler3DController.MEASUREMENT_CHANGED, callback);
    };

    onMeasurementDeactivated = (callback: any) => {
        this._eventSupport.on(Ruler3DController.MEASUREMENT_DEACTIVATED, callback);
    };

    /**
     * Handle the user input gestures. The event-object contains information about the type of user-interaction
     */
    public onGestureEvent (event: GestureEvent):HandleEventResult  {
        switch (event.type) {
            case GestureEventType.DRAG:
                return this.onDrag(event);
            case GestureEventType.DOWN:
                return this.onDown(event);
            case GestureEventType.DRAG_END:
                return this.onDragEnd(event);
            case GestureEventType.SINGLE_CLICK_UP:
                return this.onClick(event);
            case GestureEventType.MOVE:
                //when user "hovers" over the map, we measure, but do not confirm any point
                return this.onMove(event);
            case GestureEventType.DOUBLE_CLICK:
                //user confirms the polyline
                return this.onDoubleClick();
            case GestureEventType.SINGLE_CLICK_CONFIRMED:
                //user performed click and no double click can follow
                return this.onClickConfirmed(event);
            default:
                break;
        }
        return HandleEventResult.EVENT_IGNORED;
    }

    public setMeasureOptions  (parameter: string, state: Ruler3DControllerTypes) {
        // @ts-ignore
        this._measureOptions[parameter] = state;
        this.invalidate();
    }

    public isCurrentMeasureType (measureType: Ruler3DControllerTypes) {
        // @ts-ignore
        return this._measureOptions[Ruler3DController.MEASURE_TYPE_PARAM] === measureType;
    }

    public getMode() {
        // @ts-ignore
        const mode = this._measureOptions[Ruler3DController.MEASURE_TYPE_PARAM];
        return mode;
    }

    public setMode(name: string) {
        // @ts-ignore
        this.setMeasureOptions(Ruler3DController.MEASURE_TYPE_PARAM, name);
        // this.setMeasureOptions(Ruler3DController.MEASURE_TYPE_PARAM, CONST_MODE_3D[name]);
    }

    /**
     * This method is invoked whenever the controller is invalidated.
     */
    public onDraw (geoCanvas: GeoCanvas) {
        if (this._measurement && this._presentation) {
            // Array of {line, distance, p1, p2} where p1, p2 {modelPoint, worldPoint}
            const segments = this._measurement.segments;

            const isTypeOrtho = this.isCurrentMeasureType(Ruler3DControllerTypes.MEASURE_TYPE_ORTHO);
            const isTypeHeight = this.isCurrentMeasureType(Ruler3DControllerTypes.MEASURE_TYPE_HEIGHT);
            const isTypeArea = this.isCurrentMeasureType(Ruler3DControllerTypes.MEASURE_TYPE_AREA);


            if (isTypeArea) {
                this._presentation.drawArea(geoCanvas, segments);
            }

            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];

                this._presentation.drawSegmentPoints(geoCanvas, segment, i);

                if (!isTypeHeight) {
                    this._presentation.drawSegment(geoCanvas, segment);
                }

                if (isTypeOrtho) {
                    this._presentation.drawOrtho(geoCanvas, segment);
                }

                if (isTypeHeight) {
                    this._presentation.drawHeight(geoCanvas, segment, i);
                }
            }
            // Controller implements Evented - inform listeners that measure results changed
            // this.emit(Ruler3DController.MEASUREMENT_CHANGED, undefined);
            this._eventSupport.emit(Ruler3DController.MEASUREMENT_CHANGED);
        }
    }

    public onDrawLabel (labelCanvas: LabelCanvas) {
        if (this._measurement && this._presentation) {
            // Array of {line, distance, p1, p2} where p1, p2 {modelPoint, worldPoint}
            const segments = this._measurement.segments;

            const isTypeOrtho = this.isCurrentMeasureType(Ruler3DControllerTypes.MEASURE_TYPE_ORTHO);
            const isTypeHeight = this.isCurrentMeasureType(Ruler3DControllerTypes.MEASURE_TYPE_HEIGHT);
            const isTypeArea = this.isCurrentMeasureType(Ruler3DControllerTypes.MEASURE_TYPE_AREA);


            if (isTypeArea) {
                this._presentation.drawAreaLabel(labelCanvas, segments);
            }

            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];

                if (!isTypeHeight) {
                    this._presentation.drawSegmentLabel(labelCanvas, segment);
                }

                if (isTypeOrtho) {
                    this._presentation.drawOrthoLabel(labelCanvas, segment);
                }

                if (isTypeHeight) {
                    this._presentation.drawHeightLabel(labelCanvas, segment, i);
                }
            }
        }
    }


    private letGo =  () => {
        this._wait = false;
        this._dx = undefined;
        this._dy = undefined;
    };

    private withinSlack = (event: GestureEvent) => {
        if (!this._wait) {
            return false;
        }

        const x = event.viewPosition[0];
        const y = event.viewPosition[1];
        const dist = squaredDistance(this._dx ? this._dx :0, this._dy ? this._dy : 0, x, y);
        return (dist < SQUARED_SLACK);

        function squaredDistance(x1: number, y1: number, x2: number, y2: number) {
            return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
        }
    }

    private onDrag  (event: GestureEvent) {
        if (this._wait) {
            if (this.withinSlack(event)) {
                return HandleEventResult.EVENT_HANDLED;
            }
        } else {
            this.letGo();
        }
        return HandleEventResult.EVENT_IGNORED;
    }

    private onDragEnd (event: GestureEvent) {

        if (this.withinSlack(event)) {
            return this.onClick(event);
        }

        this.letGo();
        return HandleEventResult.EVENT_IGNORED;
    }

    private onMove  (event: GestureEvent) {
        if (this._measurement) {
            if (!this._measurement.isStarted()) {
                return HandleEventResult.EVENT_IGNORED;
            }
            this.letGo();
            this._measurement.updateLastPosition(event.viewPosition);
        }
        this.invalidate();
        return HandleEventResult.EVENT_HANDLED;
    }

    private onClickConfirmed (event: GestureEvent) {
        if (this._measurement) {
            this._measurement.startMeasures(event.viewPosition);
        }

        this.invalidate();
        return HandleEventResult.EVENT_HANDLED;
    }

    private onDown (event: GestureEvent) {
        //by holding on to the down coordinates, we can introduce a little slack
        const loc = event.viewPosition;
        this._dx = loc[0];
        this._dy = loc[1];
        this._wait = true;
        return HandleEventResult.EVENT_HANDLED;
    }

    private onClick = (event: GestureEvent) => {
        if (this._measurement) this._measurement.addNewPosition(event.viewPosition);
        this.invalidate();
        return HandleEventResult.EVENT_HANDLED;
    }

    private onDoubleClick = (event?: GestureEvent) => {
        if (this._measurement) this._measurement.stopMeasures();
        this.invalidate();
        return HandleEventResult.EVENT_HANDLED;
    };

    private init  (map: Map) {
        const mapReference = map.reference; // "EPSG:4978"
        const shapeReference = ReferenceProvider.getReference("EPSG:4326"); // 3D WGS:84

        const geoContext = {
            geodesy: GeodesyFactory.createCartesianGeodesy(mapReference),
            mapReference,
            modelToWorldTx: TransformationFactory.createTransformation(shapeReference, mapReference),
            shapeReference,
            viewToWorldTx: map.getViewToMapTransformation(LocationMode.CLOSEST_SURFACE),
            worldToModelTx: TransformationFactory.createTransformation(mapReference, shapeReference),
        };

        this._measurement = new Measurement(geoContext);
        this._presentation = Ruler3DPresentation.createPresentation(geoContext);
    }
}

export default Ruler3DController;
