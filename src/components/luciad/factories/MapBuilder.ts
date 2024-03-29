import {ApplicationCommandsTypes} from "../../../commands/ApplicationCommandsTypes";
import {Map} from "@luciad/ria/view/Map";
import {ApplicationCommands} from "../../../commands/ApplicationCommands";
import {LayerTypes} from "../layertypes/LayerTypes";
import ModelFactory from "./ModelFactory";
import LayerFactory from "./LayerFactory";
import {AdvanceLayerTools} from "../layerutils/AdvanceLayerTools";
import {WMSTileSetLayer} from "@luciad/ria/view/tileset/WMSTileSetLayer";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {RasterTileSetLayer} from "@luciad/ria/view/tileset/RasterTileSetLayer";
import {LayerTree} from "@luciad/ria/view/LayerTree";
import {
    CreateLayerGroupCommand,
    CreateRootLayerCommand,
    LayerConnectCommandsTypes
} from "../../../commands/ConnectCommands";
import {LayerGroup} from "@luciad/ria/view/LayerGroup";
import {Layer} from "@luciad/ria/view/Layer";
import {UrlTileSetModel} from "@luciad/ria/model/tileset/UrlTileSetModel";
import {WMSTileSetModel} from "@luciad/ria/model/tileset/WMSTileSetModel";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel";
import {BingMapsTileSetModel} from "@luciad/ria/model/tileset/BingMapsTileSetModel";
import {WMTSTileSetModel} from "@luciad/ria/model/tileset/WMTSTileSetModel";
import {FusionTileSetModel} from "@luciad/ria/model/tileset/FusionTileSetModel";
import {OGC3DTilesModel} from "@luciad/ria/model/tileset/OGC3DTilesModel";
import {TileSet3DLayer} from "@luciad/ria/view/tileset/TileSet3DLayer";
import {DefaultMapController} from "../controllers/DefaultMapController";
import {PanoramaActions} from "../controllers/actions/PanoramaActions";

function PromiseToModel<mytype>(model:any) {
    return new Promise<mytype>((resolve)=>resolve(model));
}

class MapBuilder {

    static executeCommand(command: ApplicationCommandsTypes, map: Map) {
        if (map && command){
            const layerTree = map.layerTree;
            switch (command.action) {
                case ApplicationCommands.CREATELAYER:
                    MapBuilder.createAnyLayer(command, map, layerTree);
                    break;
            }
        }
    }

    static createAnyLayer(command: LayerConnectCommandsTypes, map: Map,  target?: LayerTree) {
        return new Promise<Layer | LayerGroup | LayerTree>(resolve => {
            let layerPromise = null;
            switch (command.parameters.layerType) {
                case LayerTypes.FeaturesVerticalAnnotations:
                    layerPromise = MapBuilder.buildAnyLayer<FeatureModel, FeatureLayer>(command, ModelFactory.createVerticalModel, LayerFactory.createVerticalFeatureLayer);
                    break;
                case LayerTypes.FeaturesGeoJSONPhotos:
                    layerPromise = MapBuilder.buildAnyLayer<FeatureModel, FeatureLayer>(command, ModelFactory.createRestAPIModel, LayerFactory.createGeoLocatedPhotosLayer);
                    break;
                case LayerTypes.PortOrthophotoLayer:
                    layerPromise = MapBuilder.buildAnyLayer<FeatureModel, FeatureLayer>(command, ModelFactory.createRestAPIModel, LayerFactory.createPortOrthophotoLayer);
                    break;
                case LayerTypes.VOrthophotoAPILayer:
                    layerPromise = MapBuilder.buildAnyLayer<FeatureModel, FeatureLayer>(command, ModelFactory.createRestAPIModel, LayerFactory.createVOrthoRestAPILayer);
                    break;
                case LayerTypes.DronePhotoAPILayer:
                    layerPromise = MapBuilder.buildAnyLayer<FeatureModel, FeatureLayer>(command, ModelFactory.createRestAPIModel, LayerFactory.createDronePhotoRestAPILayer);
                    break;
                case LayerTypes.PanoramicPortAILayer:
                    layerPromise = MapBuilder.buildAnyLayer<FeatureModel, FeatureLayer>(command, ModelFactory.createPanoramicPortAIModel, LayerFactory.createPanoramicPortAILayer);
                    break;
                case LayerTypes.PanoramicLayer:
                    layerPromise = MapBuilder.buildAnyLayer<FeatureModel, FeatureLayer>(command, ModelFactory.createPanoramicFusionModel, LayerFactory.createPanoramicFusionLayer);
                    break;
                case LayerTypes.WFSLayer:
                    layerPromise = MapBuilder.buildAnyLayer<FeatureModel, FeatureLayer>(command, ModelFactory.createWFSModel, LayerFactory.createWFSLayer);
                    break;
                case LayerTypes.FeaturesFileLayer:
                    layerPromise = MapBuilder.buildAnyLayer<FeatureModel, FeatureLayer>(command, ModelFactory.createFeaturesFileModel, LayerFactory.createFeaturesFileLayer);
                    break;
                case LayerTypes.WMSLayer:
                    layerPromise = MapBuilder.buildAnyLayer<WMSTileSetModel, WMSTileSetLayer>(command, ModelFactory.createWMSModel, LayerFactory.createWMSLayer);
                    break;
                case LayerTypes.WMTSLayer:
                    layerPromise = MapBuilder.buildAnyLayer<WMTSTileSetModel, RasterTileSetLayer>(command, ModelFactory.createWMTSModel, LayerFactory.createWMTSLayer);
                    break;
                case LayerTypes.LTSLayer:
                    layerPromise = MapBuilder.buildAnyLayer<FusionTileSetModel, RasterTileSetLayer>(command, ModelFactory.createLTSModel, LayerFactory.createLTSLayer);
                    break;
                case LayerTypes.TMSLayer:
                    layerPromise = MapBuilder.buildAnyLayer<UrlTileSetModel, RasterTileSetLayer>(command, ModelFactory.createTMSModel, LayerFactory.createTMSLayer);
                    break;
                case LayerTypes.BingMapsLayer:
                    layerPromise = MapBuilder.buildAnyLayer<BingMapsTileSetModel, RasterTileSetLayer>(command, ModelFactory.createBingMapsModel, LayerFactory.createBingMapsLayer);
                    break;
                case LayerTypes.OGC3DTilesLayer:
                    layerPromise = MapBuilder.buildAnyLayer<OGC3DTilesModel, TileSet3DLayer>(command, ModelFactory.createOGC3DTilesModel, LayerFactory.createOGC3DTilesLayer);
                    break;
                case LayerTypes.LayerGroup:
                    layerPromise = MapBuilder.buildLayerGroup(command, map);
                    break;
                case LayerTypes.Root:
                    layerPromise = MapBuilder.buildRoot(command, map);
                    break;
                default:
                    console.log("Unknown LayerType: " + command.parameters.layerType);
                    break;

            }
            layerPromise?.then(layer=> {
                if (command.parameters.layerType === LayerTypes.Root ) {
                    // Do nothing
                } else {
                    if (command.parameters.layerType === LayerTypes.LayerGroup) {
                        if (command.parameters.nodes) {
                            delete command.parameters.nodes;
                        }
                        const restoreCommand = MapBuilder.clone(command);
                        if (restoreCommand.reusableModel) delete restoreCommand.reusableModel;
                        (layer as any).restoreCommand = restoreCommand;
                        if (restoreCommand.parameters.autoZoom) {
                            restoreCommand.parameters.autoZoom = false;
                            delete restoreCommand.parameters.autoZoom;
                            AdvanceLayerTools.fitToLayer(map, layer);
                        }
                    } else {
                        const restoreCommand = MapBuilder.clone(command);
                        if (restoreCommand.reusableModel) delete restoreCommand.reusableModel;
                        (layer as any).restoreCommand = restoreCommand;
                        if (restoreCommand.parameters.autoZoom) {
                            restoreCommand.parameters.autoZoom = false;
                            delete restoreCommand.parameters.autoZoom;
                            AdvanceLayerTools.fitToLayer(map, layer);

                            if (restoreCommand.parameters.layerType === LayerTypes.PanoramicLayer || restoreCommand.parameters.layerType === LayerTypes.PanoramicPortAILayer) {
                                if (map && (map as any)._myPanoramaActions) {
                                    const panoActions = (map as any)._myPanoramaActions as PanoramaActions;
                                    map.controller = DefaultMapController.getPanoramaConmtroller(panoActions, layer as FeatureLayer);
                                }
                            }
                        }
                    }
                    if (target) {
                        target.addChild(layer);
                    }
                }
                resolve(layer);
            })
        })
    }

    private static clone(command: ApplicationCommandsTypes) {
        return JSON.parse(JSON.stringify(command));
    }

    private static buildLayerGroup(commandInput: ApplicationCommandsTypes, map: Map) {
        const command = commandInput as CreateLayerGroupCommand;
        const layerTree = LayerFactory.createLayerGroup(command.parameters.layer);
        return new Promise<LayerTree>((resolve => {
            if (layerTree && typeof command.parameters.nodes !== "undefined"){
                const promises = [];
                for (const node of command.parameters.nodes) {
                    promises.push(MapBuilder.createAnyLayer(node, map));
                }
                Promise.all(promises).then(layers=>{
                    for(const layer of layers){
                        layerTree.addChild(layer);
                    }
                    resolve(layerTree);
                }, (status) => {
                    // Just to catch the error 8989
                    if (typeof status !== "undefined"){
                        MapBuilder.logMessage(status);
                    } else {
                        MapBuilder.logError("Failed to create layer");
                    }
                })
            }
            resolve(layerTree)
        }))
    }

    private static buildRoot(commandInput: ApplicationCommandsTypes, map: Map) {
        const command = commandInput as CreateRootLayerCommand;
        const layerTree = map.layerTree;
        return new Promise<LayerTree>((resolve => {
            layerTree.removeAllChildren();
            if (layerTree && typeof command.parameters.nodes !== "undefined"){
                const promises = [];
                for (const node of command.parameters.nodes) {
                    promises.push(MapBuilder.createAnyLayer(node, map));
                }
                Promise.all(promises).then(layers=>{
                    for(const layer of layers){
                        layerTree.addChild(layer);
                    }
                    resolve(layerTree);
                }, (status) => {
                    // Just to catch the error 8989
                    if (typeof status !== "undefined"){
                        MapBuilder.logMessage(status);
                    } else {
                        MapBuilder.logError("Failed to create layer");
                    }
                })
            }
            resolve(layerTree)
        }))
    }

    private static logMessage(s: string) {
        // ScreenMessage.showMessage(s)
    }


    private static logError(s: string) {
        // ScreenMessage.error(s);
    }

    private static buildAnyLayer<M,L>(command: LayerConnectCommandsTypes, createModel: (modelOptions: any)=>Promise<M>, createLayer: (m:M, layerOptions: any) => Promise<L>) {
        return new Promise<L>((resolve => {
            const modelPromise = command.parameters.reusableModel ? PromiseToModel<M>(command.parameters.reusableModel) : createModel(command.parameters.model);
            modelPromise.then((model)=>{
                delete command.parameters.reusableModel;
                const layerPromise = createLayer(model, command.parameters.layer);
                layerPromise.then(layer=>{
                    resolve(layer);
                })
            })
        }))
    }

}


export {
    MapBuilder
}