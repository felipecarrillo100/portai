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
import {createEllipsoidalGeodesy} from "@luciad/ria/geodesy/GeodesyFactory";
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

class LayerFactory {

    static EditVOrtho(map: Map, feature: Feature, type: string) {
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

    static createFeaturesFileLayer(model: FeatureModel, layerOptions: any) {
        return new Promise<FeatureLayer>((resolve)=>{
            const layer = new FeatureLayer(model, layerOptions);
            resolve(layer);
        })
    }

    static LookFrom(map: Map, feature: Feature) {
        const pvShapeReference = getReference("CRS:84");
        const pvGeodesy = createEllipsoidalGeodesy(pvShapeReference);
        const line = feature.shape as Polyline;
        const p0 = line.getPoint(0);
        const p1 = line.getPoint(1);
        const distance = pvGeodesy.distance(p1, p0);
        const azimuth = pvGeodesy.forwardAzimuth(p1, p0);
        const center = line.focusPoint;
        const viewPoint = pvGeodesy.interpolate(center, distance *1.0, azimuth + 90, LineType.SHORTEST_DISTANCE);
        const h = feature.properties.max - feature.properties.min;
        const viewPointElevated = createPoint(viewPoint.reference, [viewPoint.x, viewPoint.y, h]);
        map.mapNavigator.lookFrom(viewPointElevated, azimuth-90,0,0, {animate: true})
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
                if ((layer as any).restoreCommand) {
                    const layerAny = (layer as any).restoreCommand.parameters.layer;
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
                    LayerFactory.applyVisualProperties(layer, (layer as any).restoreCommand.layer.visualProperties);
                }
                resolve(layer);
            } else {
                reject();
            }
        });
    }

    private static applyVisualProperties(layer: any, visualProperties: any, updateRestoreCommand?: boolean) {
        updateRestoreCommand = typeof updateRestoreCommand !== "undefined" ? updateRestoreCommand : true;

        if (layer && layer.restoreCommand && layer.restoreCommand.layer) {
            if (updateRestoreCommand) {
                layer.restoreCommand.layer.visualProperties = visualProperties;
            }
            layer.currentExpression = {};
            if (visualProperties.type === "PointCloud") {
                if (visualProperties.filterActive && visualProperties.filters.length > 0) {
                    const expression = ExpressionBuilder.visibilityExpression(visualProperties.filters[visualProperties.currentFilter]);
                    layer.pointCloudStyle.visibilityExpression = expression.expression();
                    layer.currentExpression.visibilityExpression = expression;
                }
                if (!visualProperties.filterActive) {
                    layer.pointCloudStyle.visibilityExpression = undefined;
                }
                if (visualProperties.styleActive && visualProperties.styles.length > 0) {
                    const expression = ExpressionBuilder.colorExpression(visualProperties.styles[visualProperties.currentStyle]);
                    layer.pointCloudStyle.colorExpression = expression.expression();
                    layer.currentExpression.colorExpression = expression;
                }
                if (!visualProperties.styleActive) {
                    layer.pointCloudStyle.colorExpression = undefined;
                }
                if (visualProperties.scale) {
                    const expression = ExpressionBuilder.scaleExpression(visualProperties.scale);
                    layer.pointCloudStyle.scaleExpression = expression.expression();
                    layer.currentExpression.scaleExpression = expression;
                }
                if (typeof visualProperties.scalingMode !== "undefined") {
                    const expression = ExpressionBuilder.scalingMode(visualProperties.scalingMode);
                    layer.pointCloudStyle.scalingMode = expression.expression();
                    layer.currentExpression.scalingMode = expression;
                }
            }
        }
    }

    static createLayerGroup(options: any) {
        const layerGroup = new LayerGroup(options);
        (layerGroup as any).collapsed = options.collapsed
        return layerGroup;
    }
}

export default LayerFactory;