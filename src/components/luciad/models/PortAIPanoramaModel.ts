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
import {PanoramicImageProjectionType} from "@luciad/ria/model/tileset/PanoramicImageProjectionType";

class PortAIPanoramaModel extends PanoramaModel {
    constructor(urlToImagesOrCubeMapJson: string, options?: HttpRequestOptions) {
        const myStructure = createPowerOfTwoStructure({
            level0Columns: 16,
            level0Rows: 8,
            //levelCount: 4,
             levelCount: 4,
            tileWidth: 214,   //Level:Q 3
            tileHeight: 214,  //Level:Q 3

            //tileWidth: 256,   //Level:Q 3
            // tileHeight: 256,  //Level:Q 3
           // tileWidth: 13664,   //Level:2
           // tileHeight: 6832,  //Level:2
           // tileWidth: 6832,   //Level:3
           // tileHeight: 3416,  //Level:3
            //tileWidth: 3418,   //Level:4
            //tileHeight: 1709,  //Level:4
          //  tileWidth: 1708,   //Level:5
          //  tileHeight: 854,  //Level:5
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
    }

    getPanoramicImageURL(request: PanoramicImageTileRequest): string | null {
        const p = super.getPanoramicImageURL(request);
       // return "http://localhost/panoramics/images/HK_S1b_0_0_0.jpg";
        const maxY = (2*2*2*Math.pow(2, request.level)) - 1;
        const correctedY =  maxY - request.y;
//        return `http://localhost/panoramics/?filename=HK_S1b.jpg&service=GetTile&z=${request.level}&x=${request.x}&y=${correctedY}`;
        const name = request.feature.properties.name;
        const name_noext = name.split('.').slice(0, -1).join('.');
     //   return `http://localhost/panoramics/?filename=${name}&service=GetTile&z=${request.level}&x=${request.x}&y=${correctedY}`;
        // return `http://localhost:8080/image?filename=${name}&service=GetTile&z=${request.level}&x=${request.x}&y=${correctedY}&format=png`
        // return `http://localhost/panoramics/tilesq168/${name_noext}/${request.level}/${request.x}_${correctedY}.jpg`
          // return `/pano/?filename=${name}&service=GetTile&z=${request.level}&x=${request.x}&y=${correctedY}`;

        // return `/resources/tiles/tilesq168/${name_noext}/${request.level}/${request.x}_${request.y}.jpg`;
        return `/static-tiles/${name_noext}/${request.level}/${request.x}_${correctedY}.jpg`;
    }
}

export {
    PortAIPanoramaModel
}