import {FeatureContextmenuExports} from "./FeatureContextmenu";

class ContextmenuRecords {
    private static mapContextmenu: FeatureContextmenuExports | null = null;

    public static recordMapContextmenu(contextMenu: FeatureContextmenuExports) {
        ContextmenuRecords.mapContextmenu = contextMenu;
    }

    public static getMapContextmenu() {
        return ContextmenuRecords.mapContextmenu;
    }
}

export {ContextmenuRecords};