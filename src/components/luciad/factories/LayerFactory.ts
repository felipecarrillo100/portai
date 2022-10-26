import {Map} from "@luciad/ria/view/Map";
import {WMSTileSetLayer} from "@luciad/ria/view/tileset/WMSTileSetLayer";
import {WMSTileSetModel} from "@luciad/ria/model/tileset/WMSTileSetModel";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {RasterTileSetLayer} from "@luciad/ria/view/tileset/RasterTileSetLayer";
import {UrlTileSetModel} from "@luciad/ria/model/tileset/UrlTileSetModel";
import {BingMapsTileSetModel} from "@luciad/ria/model/tileset/BingMapsTileSetModel";
import {WMTSTileSetModel} from "@luciad/ria/model/tileset/WMTSTileSetModel";
import {FusionTileSetModel} from "@luciad/ria/model/tileset/FusionTileSetModel";
import {OGC3DTilesModel} from "@luciad/ria/model/tileset/OGC3DTilesModel";
import {HSPCTilesModel} from "@luciad/ria/model/tileset/HSPCTilesModel";
import {LayerType} from "@luciad/ria/view/LayerType";
import {TileSet3DLayer} from "@luciad/ria/view/tileset/TileSet3DLayer";
import ExpressionBuilder from "../expressions/ExpressionBuilder";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {Polyline} from "@luciad/ria/shape/Polyline";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {createCartesianGeodesy, createEllipsoidalGeodesy} from "@luciad/ria/geodesy/GeodesyFactory";
import {LineType} from "@luciad/ria/geodesy/LineType";
import {createPoint} from "@luciad/ria/shape/ShapeFactory";
import {PanoramaFeaturePainter} from "../painters/PanoramaFeaturePainter";
import {FusionPanoramaModel} from "@luciad/ria/model/tileset/FusionPanoramaModel";
import {UrlStore} from "@luciad/ria/model/store/UrlStore";
import {PortAIPanoramaModel} from "../models/PortAIPanoramaModel";
import {PanoramaContext} from "@luciad/ria/model/tileset/PanoramaContext";
import {LayerGroup} from "@luciad/ria/view/LayerGroup";
import {DronePhotoPainter} from "../painters/DronePhotoPainter";
import {ContextMenu} from "@luciad/ria/view/ContextMenu";
import {CreateCommand} from "../../../commands/CreateCommand";
import {ApplicationCommands} from "../../../commands/ApplicationCommands";
import {SetAppCommand} from "../../../reduxboilerplate/command/actions";
import {store} from "../../../reduxboilerplate/store";
import {VOrthophotoPanelPainter} from "../painters/VOrthophotoPanelPainter";
import {WFSFeatureStore} from "@luciad/ria/model/store/WFSFeatureStore";
import {WFSCapabilities} from "@luciad/ria/model/capabilities/WFSCapabilities";
import {identifiers} from "@luciad/ria/ogc/filter/FilterFactory";
import {ScalingMode} from "@luciad/ria/view/style/ScalingMode";
import {PointCloudPointShape} from "@luciad/ria/view/style/PointCloudPointShape";
import {PortOrthophotoPainter} from "../painters/PortOrthophotoPainter";
import {ShapeType} from "@luciad/ria/shape/ShapeType";
import {Point} from "@luciad/ria/shape/Point";
import {ShapeList} from "@luciad/ria/shape/ShapeList";
import {GeoLocatedPhotosPainter} from "../painters/GeoLocatedPhotosPainter";
import {Shape} from "@luciad/ria/shape/Shape";
import {FullScreen} from "../../../utils/fullscreen/FullScreen";
import {OutOfBoundsError} from "@luciad/ria/error/OutOfBoundsError";
import {ScreenMessage} from "../../../screen/ScreenMessage";
import {createTransformation} from "@luciad/ria/transformation/TransformationFactory";
import {LocationMode} from "@luciad/ria/transformation/LocationMode";
import {LayerTypes} from "../layertypes/LayerTypes";
import {Cursor} from "@luciad/ria/model/Cursor";
import {getFilenameFromModel} from "../cartesianmap/PortCartesianMap";
import {VerticalFeaturesShapeProvider} from "../shapeproviders/VerticalFeaturesShapeProvider";
import {CartesianAnnotationsPainter} from "../cartesianmap/CartesianAnnotationsPainter";


enum LookFromReferenceType {
  FULL=0,
  START=1,
  END=2,
  CENTER=3,
}

class LayerFactory {

    static EditVOrtho(map: Map, feature: Feature, type: string, viewPosition?: number[]) {

        const pvShapeReference = getReference("CRS:84");
        const command = CreateCommand({
            action: ApplicationCommands.CREATE_APP_FORM,
            parameters: {
                formName: "CartesianMapForm",
                data: {feature: feature, type: type}
            }
        });
        store.dispatch(SetAppCommand(command));
    }

    static EditPortOrtho(map: Map, layer: FeatureLayer, feature: Feature, type: string, viewPosition?: number[]) {
        let ratio = undefined;
        if (viewPosition) {
            console.log(viewPosition);
            if (feature.shape) {
                const points = LayerFactory.getMeasurePoint(map, viewPosition, feature.shape.reference);
                if (points && feature.shape.reference) {
                    if (feature.shape.type===ShapeType.SHAPE_LIST) {
                        const shape = feature.shape as ShapeList;
                        const p1 = shape.getShape(0) as Point;
                        const p2 = shape.getShape(1) as Point;
                        const p2Corrected = createPoint(feature.shape.reference, [p2.x, p2.y, p1.z]);
                        const p3 = createPoint(feature.shape.reference, [0, 0,]);
                        const pvGeodesy = createEllipsoidalGeodesy(feature.shape.reference);
                        pvGeodesy.shortestDistanceToLine(points.modelPoint, p1, p2Corrected,{}, p3);
                        const w = pvGeodesy.distance(p1,p2);
                        const s = pvGeodesy.distance(p1,p3);
                        ratio = s/w ;
                    }
                }
            }
        }
        const command = CreateCommand({
            action: ApplicationCommands.CREATE_APP_FORM,
            parameters: {
                formName: "PortCartesianMapForm",
                data: {feature: feature, type: type, layer: layer, ratio}
            }
        });
        store.dispatch(SetAppCommand(command));
    }

    static ShowBimIFCDFeatureInfo(map: Map, layer: TileSet3DLayer, feature: Feature) {
        console.log(feature);
        const l = layer as any;
        if (l.restoreCommand.parameters.model.featuresUrl && l.restoreCommand.parameters.model.featuresUrl.length>0) {
            const featuresUrl = l.restoreCommand.parameters.model.featuresUrl;
            WFSCapabilities.fromURL(featuresUrl).then((wfsCapabilities) => {
                const typeName = wfsCapabilities.featureTypes[0].name;
                const featureStore = WFSFeatureStore.createFromCapabilities(wfsCapabilities, typeName, {outputFormat: "json"});
                const cu = featureStore.query({filter: identifiers([feature.properties.FeatureID])});
                if (typeof cu ==='object' && typeof (cu as any).then === "function") {
                    (cu as any).then((cursor: any) => {
                        if (cursor.hasNext()) {
                            const f = cursor.next()
                            console.log(f);
                            const command = CreateCommand({
                                action: ApplicationCommands.CREATE_APP_FORM,
                                parameters: {
                                    formName: "FeatureInfoWindow",
                                    data: {feature: f}
                                }
                            });
                            store.dispatch(SetAppCommand(command));
                        }
                    })
                }
            });

        }
    }

    static createDronePhotoRestAPILayer(model: FeatureModel, layerOptions: any) {
        return new Promise<FeatureLayer>((resolve)=>{
            const layer = new FeatureLayer(model, layerOptions);
            layer.painter = new DronePhotoPainter();
            const CreateContextMenu = (layer: FeatureLayer) => (contextMenu: ContextMenu, map: Map, contextMenuInfo: any) => {
                const feature = contextMenuInfo.objects[0];
                contextMenu.addItem({label:"Edit", action: ()=>{LayerFactory.EditVOrtho(map, feature, "drone")}});
            };

            layer.onCreateContextMenu = CreateContextMenu(layer);
            resolve(layer);
        })
    }

    static createVOrthoRestAPILayer(model: FeatureModel, layerOptions: any) {
        return new Promise<FeatureLayer>((resolve)=>{
            const layer = new FeatureLayer(model, layerOptions);
            layer.painter = new VOrthophotoPanelPainter();

            const CreateContextMenu = (layer: FeatureLayer) => (contextMenu: ContextMenu, map: Map, contextMenuInfo: any) => {
                const feature = contextMenuInfo.objects[0];
                contextMenu.addItem({label:"Edit", action: ()=>{LayerFactory.EditVOrtho(map, feature, "tiff")}});
                contextMenu.addItem({label:"Flag", action: ()=>{console.log("Flag", feature)}});
                contextMenu.addItem({label:"Look from", action: ()=>{LayerFactory.LookFrom(map, feature)}});
            };

            layer.onCreateContextMenu = CreateContextMenu(layer);
            resolve(layer);
        })
    }

    static createGeoLocatedPhotosLayer(model: FeatureModel, layerOptions: any) {
        return new Promise<FeatureLayer>((resolve)=>{
            const layer = new FeatureLayer(model, layerOptions);
            layer.painter = new GeoLocatedPhotosPainter();

            // const CreateContextMenu = (layer: FeatureLayer) => (contextMenu: ContextMenu, map: Map, contextMenuInfo: any) => {
            //      const feature = contextMenuInfo.objects[0];
            //      contextMenu.addItem({label:"Edit", action: ()=>{LayerFactory.EditVOrtho(map, feature, "tiff")}});
            //  };
            // layer.onCreateContextMenu = CreateContextMenu(layer);
            const balloonProvider = (layer: FeatureLayer) => (o: Feature | Shape): string | HTMLElement => {
                const myProps = (o as Feature).properties;
                let node;
                node = document.createElement("ul", {});
                for (const key in myProps) {
                    if (myProps.hasOwnProperty(key) && key !== "uid") {
                        const item = document.createElement("li");
                        item.innerHTML = `${key}: ${myProps[key]}`;
                        node.appendChild(item);
                    }
                }
                const img = document.createElement("img");
                const div = document.createElement("div");
                const button = document.createElement("button");
                const url = (layer.model.store as any).url;
                const baseUrl = url.substring(0, url.lastIndexOf("/"));
                img.src =  baseUrl + myProps.filename;
                img.className="fade-in"
                div.className = "small-image";
                button.innerText=""
                button.onclick = ()=>{
                    console.log(layer)
                    const elem = div;
                    const fullScreen = !FullScreen.isFullscreen();
                    fullScreen ? FullScreen.requestFullscreen(elem) : FullScreen.cancelFullscreen();
                }
                div.appendChild(img)
                div.appendChild(button)
                node.appendChild(div);
                return node;
            };
            layer.balloonContentProvider = balloonProvider(layer);
            resolve(layer);
        })
    }

    static createPortOrthophotoLayer(model: FeatureModel, layerOptions: any) {
        return new Promise<FeatureLayer>((resolve)=>{
            const layer = new FeatureLayer(model, layerOptions);
            layer.painter = new PortOrthophotoPainter();

            const CreateContextMenu = (layer: FeatureLayer) => (contextMenu: ContextMenu, map: Map, contextMenuInfo: any) => {
                const feature = contextMenuInfo.objects[0];
                console.log("ContextMenu");
                console.log(layer);
                // contextMenu.addItem({label:"Edit", action: ((position:any)=>{LayerFactory.EditPortOrtho(map, layer, feature, "png") }) as any});
                contextMenu.addItem({label:"Edit", action: ((position:any)=>{LayerFactory.EditPortOrtho(map, layer, feature, "png", position) }) as any});
                contextMenu.addItem({label:"Look from", action: ()=>{LayerFactory.LookFrom(map, feature, LookFromReferenceType.FULL)}});
                contextMenu.addItem({label:"Look from start", action: ()=>{LayerFactory.LookFrom(map, feature, LookFromReferenceType.START)}});
                contextMenu.addItem({label:"Look from end", action: ()=>{LayerFactory.LookFrom(map, feature, LookFromReferenceType.END)}});
                contextMenu.addItem({label:"Look from center", action: ()=>{LayerFactory.LookFrom(map, feature, LookFromReferenceType.CENTER)}});
            };
            (model.query() as Promise<Cursor>).then((cursor: any)=>{
                const loopMe = () => {
                    const feature = cursor.next();
                    const filename = getFilenameFromModel(model, feature);
                    const url = "./annotations/" + filename.replace(/\//g, "_").replace(/\./g, "_");
                    if (feature.shape.type===ShapeType.SHAPE_LIST) {
                        const p0 = (feature.shape as ShapeList).getShape(0) as Point;
                        const p1 = (feature.shape as ShapeList).getShape(1) as Point;
                        const command3 = CreateCommand({
                            action: ApplicationCommands.CREATELAYER,
                            parameters: {
                                layerType: LayerTypes.FeaturesVerticalAnnotations,
                                model: {
                                    url,
                                    coordinates: [[p0.x, p0.y, p0.z], [p1.x, p1.y, p1.z]],
                                    image: filename
                                },
                                layer: {
                                    label: layerOptions.label.split("(")[0] + "(Annotations)",
                                    visible: true,
                                    selectable: true
                                },
                                autoZoom: true,
                            }
                        });
                        store.dispatch(SetAppCommand(command3));
                    }
                    if (cursor.hasNext()) setTimeout(loopMe, 50);
                }
                if (cursor.hasNext()) loopMe();
            })

            layer.onCreateContextMenu = CreateContextMenu(layer);
            resolve(layer);
        })
    }

    static createPanoramicPortAILayer(model: FeatureModel, layerOptions: any) {
        return new Promise<FeatureLayer>((resolve)=>{
            const store = model.store as UrlStore;
            const url =  (store as any).target;
            // const panoModel = new FusionPanoramaModel(url);
            const panoModel = new PortAIPanoramaModel(url);
            const layer = new FeatureLayer(model, {
                ...layerOptions,
                panoramaModel: panoModel,
                painter:new PanoramaFeaturePainter({
                    overview: false,
                  //  iconHeightOffset: 2.5 // sensor height in meters above street level (approx)
                    iconHeightOffset: 1 // sensor height in meters above street level (approx)
                })
            });
            resolve(layer);
        })
    }

    static createPanoramicFusionLayer(model: FeatureModel, layerOptions: any) {
        return new Promise<FeatureLayer>((resolve)=>{
            const store = model.store as UrlStore;
            const url =  (store as any).target;
            const panoModel = new FusionPanoramaModel(url);
            //console.log("pano", panoModel.)
            const xtmp = panoModel.getPanoramaDescriptor;

            (panoModel as any).getPanoramaDescriptor = (feature: Feature, context: PanoramaContext)=> {
                const a = xtmp(feature, context);
                console.log("a:", a)
                return a;
            }
            const layer = new FeatureLayer(model, {
                ...layerOptions,
                panoramaModel: panoModel,
                painter:new PanoramaFeaturePainter({
                    overview: false,
                    iconHeightOffset: 2.5 // sensor height in meters above street level (approx)
                })
            });
            resolve(layer);
        })
    }

    static createWFSLayer(model: FeatureModel, layerOptions: any) {
        return new Promise<FeatureLayer>((resolve)=>{
            const layer = new FeatureLayer(model, layerOptions);
            resolve(layer);
        })
    }

    static createFeatureLayer(model: FeatureModel, layerOptions: any) {
        return new Promise<FeatureLayer>((resolve)=>{
            const layer = new FeatureLayer(model, layerOptions);
            resolve(layer);
        })
    }

    static createVerticalFeatureLayer(model: FeatureModel, layerOptions: any) {
        return new Promise<FeatureLayer>((resolve)=>{
            const layer = new FeatureLayer(model, layerOptions);
            layer.painter = new CartesianAnnotationsPainter();
            layer.shapeProvider = new VerticalFeaturesShapeProvider(layer.model);
            resolve(layer);
        })
    }

    static createFeaturesFileLayer(model: FeatureModel, layerOptions: any) {
        return new Promise<FeatureLayer>((resolve)=>{
            const layer = new FeatureLayer(model, layerOptions);
            resolve(layer);
        })
    }

    static LookFrom(map: Map, feature: Feature, reference?: LookFromReferenceType) {
        const pvShapeReference = getReference("CRS:84");
        const pvGeodesy = createEllipsoidalGeodesy(pvShapeReference);

        let p0: Point | null =  null;
        let p1: Point | null= null;
        let center: Point | null = null;
        switch (feature.shape?.type) {
            case ShapeType.POLYLINE:{
                const line = feature.shape as Polyline;
                center = line.focusPoint;
                p0 = line.getPoint(0);
                p1 = line.getPoint(1);
            }
                break
            case ShapeType.SHAPE_LIST:
                const line = feature.shape as ShapeList;
                center = line.focusPoint as Point;
                p0 = line.getShape(0) as Point;
                p1 = line.getShape(1) as Point;
                break
        }
        if (p0 && p1 && center) {
            const distance = pvGeodesy.distance(p1, p0);
            const azimuth = pvGeodesy.forwardAzimuth(p1, p0);
         //   const middle = pvGeodesy.interpolate(p0, p1, 0.5);
            const height = p1.z;
            const proximity = 0.1;
            switch (reference) {
                case LookFromReferenceType.START: {
                    const viewPoint = pvGeodesy.interpolate(p0, distance * proximity, azimuth + 270, LineType.SHORTEST_DISTANCE);
                    const viewPointElevated = createPoint(viewPoint.reference, [viewPoint.x, viewPoint.y, height]);
                    map.mapNavigator.lookFrom(viewPointElevated, azimuth - 270, 0, 0, {animate: true})
                 }
                    break;
                case LookFromReferenceType.END:{
                    const viewPoint = pvGeodesy.interpolate(p1, distance * proximity, azimuth + 270, LineType.SHORTEST_DISTANCE);
                    const viewPointElevated = createPoint(viewPoint.reference, [viewPoint.x, viewPoint.y, height]);
                    map.mapNavigator.lookFrom(viewPointElevated, azimuth - 270, 0, 0, {animate: true})
                }
                    break;
                case LookFromReferenceType.CENTER:{
                    const viewPoint = pvGeodesy.interpolate(center, distance * proximity, azimuth + 270, LineType.SHORTEST_DISTANCE);
                    const viewPointElevated = createPoint(viewPoint.reference, [viewPoint.x, viewPoint.y, height]);
                    map.mapNavigator.lookFrom(viewPointElevated, azimuth-270,0,0, {animate: true})
                }
                    break;
                default: {
                    const viewPoint = pvGeodesy.interpolate(center, distance * 1.0, azimuth + 270, LineType.SHORTEST_DISTANCE);
                    const viewPointElevated = createPoint(viewPoint.reference, [viewPoint.x, viewPoint.y, height]);
                    map.mapNavigator.lookFrom(viewPointElevated, azimuth-270,0,0, {animate: true})
                }
            }

        }
    }


    static createWMSLayer(model: WMSTileSetModel, layerOptions: any) {
        return new Promise<WMSTileSetLayer>((resolve)=>{
            const layer = new WMSTileSetLayer(model, layerOptions)
            resolve(layer);
        })
    }

    static createTMSLayer(model: UrlTileSetModel, layerOptions: any) {
        return new Promise<RasterTileSetLayer>((resolve)=>{
            const layer = new RasterTileSetLayer(model, layerOptions);
            resolve(layer);
        })
    }

    static createBingMapsLayer(model: BingMapsTileSetModel, layerOptions: any) {
        return new Promise<RasterTileSetLayer>((resolve)=>{
            const layer = new RasterTileSetLayer(model, layerOptions);
            resolve(layer);
        })
    }

    static createWMTSLayer(model: WMTSTileSetModel, layerOptions: any) {
        return new Promise<RasterTileSetLayer>((resolve)=>{
            const layer = new RasterTileSetLayer(model, layerOptions);
            resolve(layer);
        })
    }

    static createLTSLayer(model: FusionTileSetModel, layerOptions: any) {
        return new Promise<RasterTileSetLayer>((resolve)=>{
            const layer = new RasterTileSetLayer(model, layerOptions);
            resolve(layer);
        })
    }

    static createOGC3DTilesPointCloudProperties(model:OGC3DTilesModel | HSPCTilesModel) {
        const settings = {
            scale: {
                range: {minimum: 0.2, maximum: 2},
                value: 1,
            },
            scalingMode: ScalingMode.ADAPTIVE_WORLD_SIZE,
            pointShape: PointCloudPointShape.SPHERE as (PointCloudPointShape)
        }
        return settings;
    }

    static mergeOGC3DTilesPointCloudProperties(newProperties: any, oldProperties: any) {
        const settings = {...oldProperties};
        if (typeof newProperties === "undefined") return settings;
        if (typeof newProperties.scalingMode !== "undefined") settings.scalingMode = newProperties.scalingMode;
        if (newProperties.scale && typeof newProperties.scale.range !== "undefined") settings.scale.range = newProperties.scale.range;
        if (newProperties.scale && typeof newProperties.scale.value !== "undefined") {
            if (settings.scale.range.minimum <= newProperties.scale.value && newProperties.scale.value <= settings.scale.range.maximum)
                settings.scale.value = newProperties.scale.value;
        }
        if ( typeof newProperties.pointShape !== "undefined") settings.pointShape = newProperties.pointShape;
        return settings;
    }

    static createOGC3DTilesLayer(model: OGC3DTilesModel | HSPCTilesModel, layerOptions: any) {
        let options = {...layerOptions};

        return new Promise<TileSet3DLayer>((resolve, reject) => {
            if (typeof options === "undefined") {
                options = {}
            }
            options.label = options.label ? options.label : "OGC 3D tiles";
            options.selectable = options.selectable ? options.selectable : true;
            options.transparency = options.transparency ? options.transparency : false;
            options.layerType = options.layerType ? options.layerType : LayerType.STATIC;
            options.qualityFactor = typeof options.qualityFactor !== "undefined" ? options.qualityFactor : 1.0;
            options.offsetTerrain = typeof options.offsetTerrain !== "undefined" ? options.offsetTerrain : true;

            const layer:TileSet3DLayer = new TileSet3DLayer(model, options);

            if (layer) {
                if (layerOptions) {
                    const layerAny = layerOptions;
                    let meshStyle = {
                        pbrSettings: {
                            imageBasedLighting: true,
                            directionalLighting: true,
                            lightIntensity: 0,
                            material: {
                                metallicFactor: 1,
                                roughnessFactor: 1
                            }
                        }
                    }
                    if (layerAny.meshStyle && layerAny.meshStyle.pbrSettings) {
                        meshStyle = layerAny.meshStyle
                    } else {
                        layerAny.meshStyle = meshStyle;
                    }
                    layer.meshStyle.pbrSettings = {
                        imageBasedLighting: meshStyle.pbrSettings.imageBasedLighting,
                        directionalLighting: meshStyle.pbrSettings.directionalLighting,
                        lightIntensity: meshStyle.pbrSettings.lightIntensity,
                        material: meshStyle.pbrSettings.material
                    }
                    if (layerOptions.isPointCloud) {
                        const pointCloudStyle = LayerFactory.createOGC3DTilesPointCloudProperties(model);
                        layerOptions.pointCloudStyle = LayerFactory.mergeOGC3DTilesPointCloudProperties(layerOptions.pointCloudStyle, pointCloudStyle);
                        LayerFactory.applyPointCloudStyle(layer, layerOptions.pointCloudStyle);
                    }
                }
                const CreateContextMenuBIM = (layer: TileSet3DLayer) => (contextMenu: ContextMenu, map: Map, contextMenuInfo: any) => {
                    const feature = contextMenuInfo.objects[0];
                    contextMenu.addItem({label:"Show Feature Info", action: ()=>{LayerFactory.ShowBimIFCDFeatureInfo(map, layer, feature)}});
                };
                layer.onCreateContextMenu = CreateContextMenuBIM(layer);
                resolve(layer);
            } else {
                reject();
            }
        });
    }

    public static applyPointCloudStyle(tileSet3DLayer: TileSet3DLayer, pointCloudStyle: any) {
        const layer = tileSet3DLayer as any;
        if (layer && pointCloudStyle) {
            layer.currentExpression = {};
            if (pointCloudStyle.scale) {
                const expression = ExpressionBuilder.scaleExpression(pointCloudStyle.scale);
                layer.pointCloudStyle.scaleExpression = expression.expression();
                layer.currentExpression.scaleExpression = expression;
            }
            if (typeof pointCloudStyle.scalingMode !== "undefined") {
                layer.pointCloudStyle.pointSize = {mode: pointCloudStyle.scalingMode};
                // layer.pointCloudStyle.scalingMode =  pointCloudStyle.scalingMode;
            }
        }
    }

    static createLayerGroup(options: any) {
        const layerGroup = new LayerGroup(options);
        (layerGroup as any).collapsed = options.collapsed
        return layerGroup;
    }

    private static getMeasurePoint(map: Map, viewPosition: number[], reference: any) {
        const shapeReference = reference ? reference : getReference("EPSG:4326"); // 3D WGS:84
        const mapReference = map.reference;
        const geoContext = {
            geodesy: createCartesianGeodesy(mapReference),
            modelToWorldTx: createTransformation(shapeReference, mapReference),
            shapeReference,
            viewToWorldTx: map.getViewToMapTransformation(LocationMode.CLOSEST_SURFACE),
            worldToModelTx: createTransformation(mapReference, shapeReference),
        };

        try {
            const viewPoint = createPoint(null, viewPosition);
            const worldPoint = geoContext.viewToWorldTx.transform(viewPoint);
            const modelPoint = geoContext.worldToModelTx.transform(worldPoint);
            return {
                modelPoint,
                worldPoint,
            }
        } catch (e) {
            if (!(e instanceof OutOfBoundsError)) {
                ScreenMessage.error("Error occurred: " + e);
            }
        }
    }
}

export default LayerFactory;