import {LayerTypes} from "../components/luciad/layertypes/LayerTypes";
import {ApplicationCommands} from "./ApplicationCommands";
import {Model} from "@luciad/ria/model/Model";
import {WMTSCapabilitiesTileMatrixLimits} from "@luciad/ria/model/capabilities/WMTSCapabilitiesTileMatrixSet";
import {RasterDataType} from "@luciad/ria/model/tileset/RasterDataType";
import {RasterSamplingMode} from "@luciad/ria/model/tileset/RasterSamplingMode";
import {TileLoadingStrategy} from "@luciad/ria/view/tileset/TileSet3DLayer";


export interface BoundsObject {
    reference: string;
    coordinates: number[]
}

export enum BingMapsImagerySet  {
    AERIAL="Aerial",
    ROAD="Road",
    HYBRID="AerialWithLabels",
    LIGHT="CanvasLight",
    DARK="CanvasDark",
    GRAY="CanvasGray",
}

export interface CreateLayerBaseCommand {
    action: ApplicationCommands;
    parameters: {
        layerType: LayerTypes;
        reusableModel?: Model;
        model?: {
        };
        layer?: {
            visible?: boolean;
            label?: string;
            id?: string;
            selectable?: boolean;
        },
        autoZoom?: boolean
    }
}

export interface CreateRasterLayerBaseCommand {
    action: ApplicationCommands;
    parameters: {
        layerType: LayerTypes;
        reusableModel?: Model;
        model?: {
            dataType?: RasterDataType;
            samplingMode?: RasterSamplingMode;
        };
        layer?: {
            visible?: boolean;
            label?: string;
            id?: string;
            selectable?: boolean;
        },
        autoZoom?: boolean
    }
}

export interface CreateRootLayerCommand extends CreateLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER;
    parameters: {
        layerType: LayerTypes.Root;
        reusableModel?: Model;
        model?: {
        };
        layer?: {
        },
        nodes: any[]
        autoZoom?: boolean
    }
}

export interface CreateLayerGroupCommand extends CreateLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER;
    parameters: {
        layerType: LayerTypes.LayerGroup;
        reusableModel?: Model;
        model?: {
        };
        layer?: {
            visible?: boolean;
            label?: string;
            id?: string;
        },
        nodes?: any[]
        autoZoom?: boolean
    }
}

export  interface CreateVOrthophotoCommand extends CreateLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER;
    parameters: {
        layerType: LayerTypes.VOrthophotoAPILayer;
        reusableModel?: Model;
        model: {
            url: string;
        };
        layer: {
            visible?: boolean;
            label?: string;
            id?: string;
            selectable?: boolean;
        },
        autoZoom?: boolean
    }
}

export  interface CreatePortOrthophotoLayer extends CreateLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER;
    parameters: {
        layerType: LayerTypes.PortOrthophotoLayer;
        reusableModel?: Model;
        model: {
            url: string;
        };
        layer: {
            visible?: boolean;
            label?: string;
            id?: string;
            selectable?: boolean;
        },
        autoZoom?: boolean
    }
}

export  interface CreateDronePhotoCommand extends CreateLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER;
    parameters: {
        layerType: LayerTypes.DronePhotoAPILayer;
        reusableModel?: Model;
        model: {
            url: string;
        };
        layer: {
            visible?: boolean;
            label?: string;
            id?: string;
            selectable?: boolean;
        },
        autoZoom?: boolean
    }
}


export  interface CreateLayerFeaturesFileCommand extends CreateLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER;
    parameters: {
        layerType: LayerTypes.FeaturesFileLayer;
        reusableModel?: Model;
        model: {
            filename: string;
            filePath: string;
            autoSave?: boolean;
            create?: boolean;
        };
        layer: {
            visible?: boolean;
            label?: string;
            id?: string;
            selectable?: boolean;
        },
        autoZoom?: boolean
    }
}

export  interface CreateLayerWFSCommand extends CreateLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER;
    parameters: {
        layerType: LayerTypes.WFSLayer;
        reusableModel?: Model;
        model: {
            serviceURL: string;
            typeName: string;
            referenceText: string;
        };
        layer: {
            visible?: boolean;
            label?: string;
            id?: string;
            selectable?: boolean;
        },
        autoZoom?: boolean,
        fitBounds?: BoundsObject
    }
}

export interface CreateLayerPanoramicCommand extends CreateLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER;
    parameters: {
        layerType: LayerTypes.PanoramicLayer;
        reusableModel?: Model;
        model: {
            target: string;
        };
        layer: {
            visible?: boolean;
            label?: string;
            id?: string;
            selectable?: boolean;
        },
        autoZoom?: boolean,
        fitBounds?: BoundsObject
    }
}

export interface CreateLayerPanoramicPortAICommand extends CreateLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER;
    parameters: {
        layerType: LayerTypes.PanoramicPortAILayer;
        reusableModel?: Model;
        model: {
            target: string;
        };
        layer: {
            visible?: boolean;
            label?: string;
            id?: string;
            selectable?: boolean;
        },
        autoZoom?: boolean,
        fitBounds?: BoundsObject
    }
}

export interface CreateLayerWMSCommand extends CreateRasterLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.WMSLayer;
        reusableModel?: Model;
        model: {
            getMapRoot: string;
            version?: string;
            referenceText: string;
            layers: string[];
            transparent?: boolean;
            imageFormat?: string;
            dataType?: RasterDataType;
            samplingMode?: RasterSamplingMode;
        };
        layer: {
            visible: boolean;
            label: string;
            id?: string;
        };
        autoZoom?: boolean,
        fitBounds?: BoundsObject
    }
}

export interface CreateLayerWMTSCommand extends CreateRasterLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.WMTSLayer;
        reusableModel?: Model;
        model: {
            url: string;
            referenceText: string;
            layer: string;
            tileMatrixSet: any,
            tileMatrices: string[],
            level0Columns: number;
            level0Rows: number;
            tileMatricesLimits: WMTSCapabilitiesTileMatrixLimits[];
            boundsObject: BoundsObject;
            format: string;
            levelCount: number;
            tileWidth: number;
            tileHeight: number;
            dataType?: RasterDataType;
            samplingMode?: RasterSamplingMode;
        };
        layer: {
            visible: boolean;
            label: string;
            id?: string;
        };
        autoZoom?: boolean
    }
}

export interface CreateLayerLTSCommand extends CreateRasterLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.LTSLayer;
        reusableModel?: Model;
        model: {
            coverageId: string;
            referenceText: string;
            boundsObject: BoundsObject,
            level0Columns: number;
            level0Rows: number;
            tileWidth: number;
            tileHeight: number;
            url: string;
            dataType?: RasterDataType;
            samplingMode?: RasterSamplingMode;
        };
        layer: {
            visible: boolean;
            label: string;
            id?: string;
        };
        autoZoom?: boolean
    }
}

export interface CreateLayerTMSCommand extends CreateRasterLayerBaseCommand  {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.TMSLayer;
        reusableModel?: Model;
        model: {
            baseURL: string;
            subdomains: string[];
            levelCount: number;
            dataType?: RasterDataType;
            samplingMode?: RasterSamplingMode;
        };
        layer: {
            visible: boolean;
            label: string;
            id?: string;
        };
        autoZoom?: boolean
    }
}

export interface CreateDatabaseRasterTilesetCommand extends CreateRasterLayerBaseCommand  {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.DatabaseRasterTileset;
        reusableModel?: Model;
        model: {
            tableName: string;
            levelCount: number;
            dataBounds: BoundsObject;
            dataType?: RasterDataType;
            samplingMode?: RasterSamplingMode;
        };
        layer: {
            visible: boolean;
            label: string;
            id?: string;
        };
        autoZoom?: boolean,
        fitBounds: BoundsObject
    }
}

export interface CreateLayerOGC3DTilesCommand extends CreateLayerBaseCommand  {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.OGC3DTilesLayer;
        reusableModel?: Model;
        model: {
            url: string;
            featuresUrl?: string,
        };
        layer: {
            transparency?: boolean,
            idProperty?: string,
            loadingStrategy?: TileLoadingStrategy,
            visible: boolean;
            label: string;
            id?: string;
            offsetTerrain?: boolean;
            qualityFactor: number;
            isPointCloud?: boolean,
        };
        autoZoom?: boolean
    }
}

export interface CreateLayerBingMapsCommand extends CreateRasterLayerBaseCommand  {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.BingMapsLayer;
        reusableModel?: Model;
        model: {
            token?: string;
            imagerySet: BingMapsImagerySet;
            dataType?: RasterDataType;
            samplingMode?: RasterSamplingMode;
        };
        layer: {
            visible: boolean;
            label: string;
            id?: string;
        };
        autoZoom?: boolean
    }
}

export type LayerConnectCommandsTypes = CreateLayerWFSCommand | CreateLayerWMSCommand | CreateLayerTMSCommand | CreateRootLayerCommand |
    CreateLayerGroupCommand | CreateVOrthophotoCommand | CreateDronePhotoCommand | CreateLayerPanoramicCommand | CreateLayerPanoramicPortAICommand |
    CreateLayerBingMapsCommand | CreateLayerWMTSCommand | CreateLayerLTSCommand | CreateLayerOGC3DTilesCommand | CreateLayerFeaturesFileCommand |
    CreateDatabaseRasterTilesetCommand | CreatePortOrthophotoLayer