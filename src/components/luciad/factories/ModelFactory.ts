import {WMSTileSetModel, WMSTileSetModelConstructorOptions} from "@luciad/ria/model/tileset/WMSTileSetModel";
import {WFSFeatureStore} from "@luciad/ria/model/store/WFSFeatureStore";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {UrlTileSetModel} from "@luciad/ria/model/tileset/UrlTileSetModel";
import {createBounds, createPoint, createPolygon} from "@luciad/ria/shape/ShapeFactory";
import {BingMapsTileSetModel} from "@luciad/ria/model/tileset/BingMapsTileSetModel";
import {ScreenMessageTypes} from "../../../interfaces/ScreenMessageTypes";
import {WMTSTileSetModel} from "@luciad/ria/model/tileset/WMTSTileSetModel";
import {FusionTileSetModel} from "@luciad/ria/model/tileset/FusionTileSetModel";
import {OGC3DTilesModel} from "@luciad/ria/model/tileset/OGC3DTilesModel";
import {HSPCTilesModel} from "@luciad/ria/model/tileset/HSPCTilesModel";
import {FeatureFileStore} from "../stores/FeatureFileStore";
import {RestStore} from "../stores/RestStore";
import {UrlStore} from "@luciad/ria/model/store/UrlStore";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {FeaturesRestAPIStore} from "../stores/FeaturesRestAPIStore";

const crs1Reference = getReference("CRS:1");

class ModelFactory {

    public static createPanoramicFusionModel(modelOptions: any) {
        return new Promise<FeatureModel>((resolve, reject)=> {
            const store = new UrlStore({
                target: modelOptions.target,
            });

            const model = new FeatureModel(store, {
                reference: getReference("CRS:84")
            });
            resolve(model);
        });
    }

    public static createPanoramicPortAIModel(modelOptions: any) {
        return new Promise<FeatureModel>((resolve, reject)=> {
            const store = new UrlStore({
                target: modelOptions.target,
            });

            const model = new FeatureModel(store, {
                reference: getReference("CRS:84")
            });
            resolve(model);
        });
    }

    public static createBingMapsModel(command: any) {
        return new Promise<BingMapsTileSetModel>((resolve, reject) => {
            const options ={
                imagerySet: command.imagerySet,
                token: command.token
            };

            const requestStr = `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/${options.imagerySet}?key=${options.token}&include=ImageryProviders`;

            ModelFactory.GET_JSON(requestStr).then(
                (response)=>{
                    if (response.status === 200) {
                        response.json().then(data=>{
                            let resource;
                            if (data.resourceSets[0] && data.resourceSets[0].resources[0]) {
                                resource = data.resourceSets[0].resources[0];
                                // Serve tiles over https://
                                if (resource.imageUrl.indexOf("http://ecn.") > -1) {
                                    resource.imageUrl = resource.imageUrl.replace("http:", "https:");
                                }
                                if (resource.imageUrl.indexOf("http://ak.dynamic.") > -1) {
                                    resource.imageUrl = resource.imageUrl.replace("{subdomain}.", "");
                                    resource.imageUrl = resource.imageUrl.replace("http://", "https://{subdomain}.ssl.");
                                }
                                resource.brandLogoUri = data.brandLogoUri;
                            } else {
                                resource = data;
                            }
                            const model = new BingMapsTileSetModel(resource);
                            resolve(model);
                        })
                    } else {
                        const reason = {type:ScreenMessageTypes.ERROR, message:"Failed to create layer. Bing Maps service unreachable"}
                        reject(reason);
                    }
                },
                () => {
                    const reason = {type:ScreenMessageTypes.ERROR, message:"Failed to create layer. Bing Maps service unreachable"}
                    reject(reason);
                }
            );
        });
    }

    static createWFSModel(modelOptions: any) {
        return new Promise<FeatureModel>((resolve, reject)=> {
            const store = new WFSFeatureStore({
                serviceURL: modelOptions.serviceURL,
                typeName: modelOptions.typeName,
                reference: getReference(modelOptions.referenceText)
            });

            const model = new FeatureModel(store);
            resolve(model);
        });
    }

    static createFeaturesFileModel(modelOptions: any) {
        return new Promise<FeatureModel>((resolve, reject)=> {
            const store = new FeatureFileStore(modelOptions);
            const model = new FeatureModel(store);
            resolve(model);
        });
    }

    static createVerticalModel(modelOptions: any) {
        return new Promise<FeatureModel>((resolve, reject)=> {
            if (modelOptions.image && modelOptions.coordinates) {
                const request = modelOptions.image + "?service=GetInfo"
                fetch(request).then((response)=>{
                    if (response.status===200) {
                        response.json().then(data=>{
//                            const store = new MemoryStore(modelOptions);
                            const store = new FeaturesRestAPIStore({url: modelOptions.url, reference: crs1Reference});

                            const reference = getReference("CRS:84");
                            const shape = createPolygon(reference, [[0,0,0],[0,0,1000],[0.001,0,1000],[0.001,0,0]]);
                            const feature = new Feature(shape, {}, 1);
                            const model = new FeatureModel(store, {
                                reference: crs1Reference
                            });
                            (model as any).imageInfo = data;
                            const p0 = createPoint(reference, modelOptions.coordinates[0]);
                            const p1 = createPoint(reference, modelOptions.coordinates[1]);
                            (model as any).points = [p0,p1];
                            store.add(feature);
                            resolve(model);
                        });
                    }
                })
            }
        });
    }

    static createRestAPIModel(modelOptions: any) {
        return new Promise<FeatureModel>((resolve, reject)=> {
            const store = new RestStore(modelOptions);
            const model = new FeatureModel(store);
            resolve(model);
        });
    }

    static createWMSModel(modelOptions: any) {
        return new Promise<WMSTileSetModel>((resolve, reject)=> {
            const model = new WMSTileSetModel({
                getMapRoot: modelOptions.getMapRoot,
                version: modelOptions.version ? modelOptions.version : "1.3.0",
                reference: getReference(modelOptions.referenceText),
                layers: modelOptions.layers,
                transparent: typeof modelOptions.transparent !== "undefined" ? modelOptions.transparent : false,
                imageFormat: typeof modelOptions.imageFormat !== "undefined" ? modelOptions.imageFormat : "image/png",
            });
            resolve(model);
        })
    }

    static createLTSModel(modelOptions: any) {
        return new Promise<FusionTileSetModel>((resolve, reject)=> {
            const options = {...modelOptions};
            options.bounds = createBounds(getReference(modelOptions.boundsObject.reference), modelOptions.boundsObject.coordinates);
            delete options.boundsObject;
            options.reference = getReference(modelOptions.referenceText);
            delete options.referenceText;
            options.format = typeof options.format !== "undefined" ? options.format : "image/png";
            const model = new FusionTileSetModel(options);
            resolve(model);
        })
    }

    static createWMTSModel(modelOptions: any) {
        return new Promise<WMTSTileSetModel>((resolve, reject)=> {
            const options = {...modelOptions};
            options.bounds = createBounds(getReference(modelOptions.boundsObject.reference), modelOptions.boundsObject.coordinates);
            delete options.boundsObject;
            options.reference = getReference(modelOptions.referenceText);
            delete options.referenceText;
            options.format = typeof options.format !== "undefined" ? options.format : "image/png";
            const model = new WMTSTileSetModel(options);
            resolve(model);
        })
    }

    static createTMSModel(modelOptions: any) {
        return new Promise<UrlTileSetModel>((resolve, reject) => {
            const REF_WEBMERCATOR = getReference("EPSG:3857");
            const bounds = createBounds(REF_WEBMERCATOR, [-20037508.34278924, 40075016.68557848, -20037508.352, 40075016.704]);

            const reference = REF_WEBMERCATOR;
            const model = new UrlTileSetModel({
                baseURL: modelOptions.baseURL,
                bounds,
                reference,
                subdomains: modelOptions.subdomains,
                levelCount: modelOptions.levelCount
                }
            );
            if (model) {
                resolve(model);
            } else {
                reject();
            }
        });
    }

    static createOGC3DTilesModel(OGC3DTilesSettings: any) {
        return new Promise<OGC3DTilesModel>((resolve, reject) => {
            OGC3DTilesSettings = {...OGC3DTilesSettings};
            delete OGC3DTilesSettings.attributionParams;

            OGC3DTilesModel.create(OGC3DTilesSettings.url, OGC3DTilesSettings).then((model) => {
                if (model && model.modelDescriptor && model.modelDescriptor.type === "OGC3D") {
                    resolve(model);
                } else {
                    reject(null);
                }
            }, () => {
                reject();
            });
        });
    }

    public createHSPCModel(OGC3DTilesSettings: any) {
        return new Promise<HSPCTilesModel>((resolve, reject) => {
            OGC3DTilesSettings = {...OGC3DTilesSettings};
            delete OGC3DTilesSettings.attributionParams;

            HSPCTilesModel.create(OGC3DTilesSettings.url, OGC3DTilesSettings).then((model) => {
                if (model && model.modelDescriptor && model.modelDescriptor.type === "HSPC") {
                    resolve(model);
                } else {
                    const reason = {type: ScreenMessageTypes.ERROR, message: "Not a valid HSPC model"}
                    reject(null);
                }
            }, (err) => {
                const reason = {type: ScreenMessageTypes.ERROR, message: err.message}
                reject(reason);
            });
        });
    }

    private static GET_JSON(url: string) {
        const requestOptions = {
            method: 'GET',
            redirect: 'follow'
        } as any;
        return fetch(url, requestOptions);
    }


}

export default ModelFactory;