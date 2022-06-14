import {
    PanoramaModel,
    PanoramaModelConstructorOptions,
    PanoramicImageTileRequest
} from "@luciad/ria/model/tileset/PanoramaModel";
import {HttpRequestOptions} from "@luciad/ria/util/HttpRequestOptions";
import {CubeMapPanoramaDescriptor, SingleImagePanoramaDescriptor} from "@luciad/ria/model/tileset/PanoramaDescriptor";
import {createPowerOfTwoStructure, PanoramaTileSetStructure} from "@luciad/ria/model/tileset/PanoramaTileSetStructure";
import {PanoramaType} from "@luciad/ria/model/tileset/PanoramaType";
import {PanoramaContext} from "@luciad/ria/model/tileset/PanoramaContext";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {
    EquirectangularPanoramicImageProjection,
    PanoramicImageProjection
} from "@luciad/ria/model/tileset/PanoramicImageProjection";
import {PanoramicImageProjectionType} from "@luciad/ria/model/tileset/PanoramicImageProjectionType";

class PortAIPanoramaModel extends PanoramaModel {
    constructor(urlToImagesOrCubeMapJson: string, options?: HttpRequestOptions) {
        const myStructure = createPowerOfTwoStructure({
            level0Columns: 1,
            level0Rows: 1,
            levelCount: 1,
            //tileWidth: 3416,
            tileWidth: 3414,
            // tileHeight: 1708,
            tileHeight: 1707,
            imageDataFractionX: 1,
            imageDataFractionY: 1
        });
        const myDescriptor: SingleImagePanoramaDescriptor = {
            projection: { type: PanoramicImageProjectionType.EQUIRECTANGULAR},
            structure: myStructure,
            type: PanoramaType.SINGLE_IMAGE
        }

        const o: PanoramaModelConstructorOptions = {
            ...options,
            panoramaDescriptor: myDescriptor,
            baseURL: urlToImagesOrCubeMapJson,
        }
        super(o);
    }

    getPanoramaDescriptor(feature: Feature, context: PanoramaContext): CubeMapPanoramaDescriptor | SingleImagePanoramaDescriptor | null {
        const c = super.getPanoramaDescriptor(feature, context)
        return c;
    };

    getPanoramicImageURL(request: PanoramicImageTileRequest): string | null {
        const p = super.getPanoramicImageURL(request);
       // return "http://localhost/panoramics/images/HK_S1b_0_0_0.jpg";
        const maxY = Math.pow(2, request.level) - 1;
        const correctedY =  maxY - request.y;
//        return `http://localhost/panoramics/?filename=HK_S1b.jpg&service=GetTile&z=${request.level}&x=${request.x}&y=${correctedY}`;
        const name = request.feature.properties.name;
        return `http://localhost/panoramics/?filename=${name}&service=GetTile&z=${request.level}&x=${request.x}&y=${correctedY}`;
    };
}

export {
    PortAIPanoramaModel
}