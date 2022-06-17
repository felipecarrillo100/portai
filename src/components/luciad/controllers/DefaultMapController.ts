import {CompositeController} from "./CompositeController";
import {GestureEventType} from "@luciad/ria/view/input/GestureEventType";
import {ENABLED_CHANGE_EVENT, LookFromNavigationController} from "./panocontroller/LookFromNavigationController";
import {NoopController} from "./panocontroller/NoopController";
import {
    END_MOVE_TO_PANORAMA_EVENT,
    ENTERED_PANORAMA_MODE_EVENT, LEFT_PANORAMA_MODE_EVENT,
    PanoramaActions,
    START_MOVE_TO_PANORAMA_EVENT
} from "./actions/PanoramaActions";
import {HoverFeatureController} from "./panocontroller/HoverFeatureController";
import {FEATURE_CLICKED, FeatureClickController} from "./panocontroller/FeatureClickController";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {PanoramaFeaturePainter} from "../painters/PanoramaFeaturePainter";
import {LeavePanoramaController} from "./panocontroller/LeavePanoramaController";
import {PanoramicController} from "./panocontroller/PanoramicController";



class DefaultMapController {
    static getDefaultMapController() {
        return null;
    }
/*
    static getPanoramaConmtroller(panoActions: PanoramaActions, panoLayer: FeatureLayer) {
        const handlePanoramaHover = (layer: FeatureLayer, feature: Feature | null): void => {
            const painter = layer.painter as PanoramaFeaturePainter;
            painter.setHover(feature);
            // overviewPanoramaPainter.setHover(feature);
        };
        const handlePanoramaClick = (feature: Feature): void => {
            panoActions.moveToPanorama(feature, panoLayer);
        };

        const mainMapController = new CompositeController();
        const lookFromController = new LookFromNavigationController({enabled: false});
        const leavePanoController = new LeavePanoramaController(panoActions);
        const noopController = new NoopController({
            allowedEvents: [GestureEventType.SINGLE_CLICK_CONFIRMED],
            enabled: lookFromController.enabled
        });

        panoActions.on(ENTERED_PANORAMA_MODE_EVENT, () => {
            // in pano mode, use the lookFrom controls and enable noop (which blocks normal navigation)
            lookFromController.enabled = true;
            noopController.enabled = true;
        });
        panoActions.on(START_MOVE_TO_PANORAMA_EVENT, () => {
            // while transitioning, disable lookFrom and enable noop (so the user can't do anything at all until the animation finishes)
            lookFromController.enabled = false;
            noopController.enabled = true;
        });
        panoActions.on(END_MOVE_TO_PANORAMA_EVENT, () => {
            lookFromController.enabled = true;
            noopController.enabled = true;
        });
        panoActions.on(LEFT_PANORAMA_MODE_EVENT, () => {
            // outside pano mode, disable the lookFrom controls and disable noop (which blocks normal navigation)
            lookFromController.enabled = false;
            noopController.enabled = false;
        });
        const hoverPanoController = new HoverFeatureController([panoLayer]);
        hoverPanoController.on("HoverFeature", handlePanoramaHover);
        const clickPanoController = new FeatureClickController([panoLayer]);
        clickPanoController.on(FEATURE_CLICKED, handlePanoramaClick);

        lookFromController.on(ENABLED_CHANGE_EVENT, (enabled) => {
            noopController.enabled = enabled;
        });

        mainMapController.appendController(hoverPanoController);
        mainMapController.appendController(clickPanoController);
        mainMapController.appendController(lookFromController);
        mainMapController.appendController(leavePanoController);
        mainMapController.appendController(noopController);

        return mainMapController;
    } */

    static getPanoramaConmtroller(panoActions: PanoramaActions, panoLayer: FeatureLayer) {
        const mainMapController = new PanoramicController(panoActions, panoLayer);
        return mainMapController;
    }

}

export {
    DefaultMapController
}