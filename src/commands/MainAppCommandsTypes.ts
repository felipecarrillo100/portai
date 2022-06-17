
import {ApplicationCommands} from "./ApplicationCommands";
import {ScreenMessageTypes} from "../interfaces/ScreenMessageTypes";
//import {AlertButton} from "@ionic/core/components";

interface MainAppShowToast {
    action: ApplicationCommands.APPTOAST;
    parameters: {
        type: ScreenMessageTypes
        message: string;
    }
}

interface MainAppShowAlert {
    action: ApplicationCommands.APPALERT;
    parameters: {
        header: string;
        message: string;
       // buttons?: AlertButton[];
    }
}

interface MainAppToggleFullScreen {
    action: ApplicationCommands.TOGGLE_FULL_SCREEN;
    parameters: {
        value?: boolean;
    }
}


export type MainAppCommandsTypes = MainAppShowToast | MainAppShowAlert | MainAppToggleFullScreen
