import {
    PanoramaActions,
} from "./actions/PanoramaActions";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {PanoramicController} from "./panocontroller/PanoramicController";



class DefaultMapController {
    static getDefaultMapController() {
        return null;
    }


    static getPanoramaConmtroller(panoActions: PanoramaActions, panoLayer: FeatureLayer) {
        const mainMapController = new PanoramicController(panoActions, panoLayer);
        return mainMapController;
    }

}

export {
    DefaultMapController
}