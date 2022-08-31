import React, {useEffect, useRef, useState} from "react";
import {Map} from "@luciad/ria/view/Map";
import {WebGLMap} from "@luciad/ria/view/WebGLMap";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";

import "./LuciadMap.scss";
import {MapHandler} from "./layertreetools/MapHandler";
import TreeNodeInterface from "../../interfaces/TreeNodeInterface";
import {ApplicationCommandsTypes} from "../../commands/ApplicationCommandsTypes";
import {MapBuilder} from "./factories/MapBuilder";
import {ApplicationCommands} from "../../commands/ApplicationCommands";
import {LayerTreeScanner} from "./layertreetools/LayerTreeScanner";
import {LayerConnectCommandsTypes} from "../../commands/ConnectCommands";
import {ScreenMessage} from "../../screen/ScreenMessage";
import {DefaultMapController} from "./controllers/DefaultMapController";
import {ContextMenu} from "@luciad/ria/view/ContextMenu";
import {ContextmenuRecords} from "../contextmenu/ContextmenuRecords";
import {MouseCoordinateReadout} from "./mousecoordinates/MouseCoordinateReadout";
import {
    ENTERED_PANORAMA_MODE_EVENT,
    LEFT_PANORAMA_MODE_EVENT,
    PanoramaActions
} from "./controllers/actions/PanoramaActions";
import {Handle} from "@luciad/ria/util/Evented";
import Button from "@mui/material/Button";
import {ZoomControlMini} from "../ZoomControlMini/ZoomControlMini";
import {CompassButton} from "../CompassMini/CompassButton";

interface Props {
    id?: string;
    className?: string;
    proj?: string;
    onMapChange?: (newMap:Map | null) => void;
    onLayersChange?: (newMap:TreeNodeInterface | null) => void;
    onCurrentLayersChange?: (layerId: string | null) => void;
    onSaveMap?: (newMap: { mapState: any; proj: string; layerCommand: LayerConnectCommandsTypes } | null) => void;
    command?: ApplicationCommandsTypes | null;
}

const LuciadMap: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {
    const [showLeaveButton, setShowLeaveButton] = useState(false);
    const controllerChangedHandler = useRef<Handle | null>(null);

    const divEl = useRef(null);
    const proj = useRef("EPSG:4978");
    const map = useRef(null as Map | null);

    useEffect(()=>{
        //  On Create
        console.log("Map created")
        return () => {
            // On destroy
            console.log("Map destroyed");
            destroyMap();
        }
    }, []);

    useEffect(()=>{
        if (map && props.command) {
            executeCommand(props.command);
        }
    }, [props.command]);

    const executeCommand = (command: ApplicationCommandsTypes | null) => {
        if (map.current && command) {
            switch (command.action ) {
                case ApplicationCommands.CREATELAYER:
                    MapBuilder.executeCommand(command, map.current);
                break;
                case ApplicationCommands.REFRESHLAYERS:
                    startRefresh();
                    break;
                case ApplicationCommands.MAPSAVESTATUS:
                    triggerMapSave();
                    break;
                case ApplicationCommands.MAPRESTORE:
                    restoreMap(command.parameters);
                    break;
                case ApplicationCommands.MAPRESET:
                    resetMap();
                    break;
            }
        }
    }

    function restoreMap(parameters: {layerCommand: LayerConnectCommandsTypes; mapState: any}) {
        if (map.current) {
            map.current.restoreState(parameters.mapState);
            executeCommand(parameters.layerCommand);
        }
    }

    function resetMap() {
        destroyMap();
        createMap();
    }

    const triggerMapSave = () => {
        if (map.current) {
            const layerCommand = LayerTreeScanner.getLayerTreeCommand(map.current.layerTree, {withModels: false});
            const mapState = map.current.saveState();
            const result = {
                layerCommand,
                mapState,
                proj: proj.current
            }
            if (typeof props.onSaveMap === "function") {
                props.onSaveMap(result);
            }
        }
    }

    const startRefresh = () => {
      if (map.current) {
          const mapHandler = (map.current as any).mapHandler as MapHandler;
          mapHandler.triggerRefresh();
      }
    }

    const saveLayers = () => {
        return map.current ? LayerTreeScanner.getLayerTreeCommand(map.current.layerTree, {withModels: true}) : null;
    }

    const restoreLayers = (savedLayers: any) => {
        if (map.current) {
           MapBuilder.executeCommand(savedLayers, map.current);
        }
    }

    useEffect(() => {
        proj.current = props.proj ? props.proj : "EPSG:4978";
        let savedLayers = null;
        let mapState = null;
        if (map.current) {
            savedLayers = saveLayers();
            mapState = map.current.saveState();
            // console.log(savedLayers);
        }
        destroyMap();
        createMap();
        if (map.current ) {
            if (mapState) {
                try {
                    map.current.restoreState(mapState)
                } catch (err) {
                    ScreenMessage.warning("Failed to restore map bounds");
                }
            }
            restoreLayers(savedLayers);
        }
    },[props.proj]);

    const onShowContextMenu = (position: number[], contextMenu: ContextMenu) => {
        const menu = ContextmenuRecords.getMapContextmenu();
        if (menu) {
            const o = {
                clientX: position[0],
                clientY: position[1],
                menuItems: contextMenu.items.map(item=>({title:item.label, action: item.action}))
            }
          //  console.log(o)
            menu.openMenu(o);
        }
    }

    const createMap = () => {
        if (divEl.current !== null) {
            const newMap = new WebGLMap(divEl.current, { reference: getReference(proj.current) });
            if (newMap) {
                const myPanoramaActions = new PanoramaActions(newMap);
                (newMap as any)._myPanoramaActions = myPanoramaActions;
                let enteredListener = myPanoramaActions.on(ENTERED_PANORAMA_MODE_EVENT, () => {
                    setShowLeaveButton(true);
                });
                let leftListener = myPanoramaActions.on(LEFT_PANORAMA_MODE_EVENT, () => {
                    setShowLeaveButton(false)
                });
            }
            if (newMap.mapNavigator.constraints.above) newMap.mapNavigator.constraints.above.minAltitude = 0; // 0.5;
            newMap.onShowContextMenu = onShowContextMenu;
            const mapHandler = new MapHandler(newMap);
            mapHandler.onLayerTreeChange = notifyLayerChange;
            mapHandler.onCurrentLayerChange = notifyCurrentLayerChange;
            (newMap as any).mapHandler = mapHandler;
            newMap.controller = DefaultMapController.getDefaultMapController();
            newMap.effects.ambientOcclusion = {
                radius: 30,
                power: 1.2
            }
            map.current = newMap;
            notifyMapChange();
            mapCreateLayers();
            mapInitialize();
        }
    }

    const notifyMapChange = () => {
        if (typeof props.onMapChange === "function") {
            props.onMapChange(map.current);
        }
    }

    const notifyLayerChange = (node: TreeNodeInterface) => {
        if (typeof props.onLayersChange === "function") {
            props.onLayersChange(node);
        }
    }

    const notifyCurrentLayerChange = (layerId: string | null) => {
        if (typeof props.onCurrentLayersChange === "function") {
            props.onCurrentLayersChange(layerId);
        }
    }

    const destroyMap = () => {
        if (map.current !== null) {
            if (map.current.controller) {
                map.current.controller = null;
            }
            if (controllerChangedHandler.current) {
                controllerChangedHandler.current.remove();
                controllerChangedHandler.current =  null;
            }
            map.current.destroy();
            map.current =  null;
            notifyMapChange();
        }
    }

    const mapInitialize = () => {

    }

    const mapCreateLayers = () => {
        if (map.current) {
            //  Create here initial layers if needed
            // const command = CreateCommand({
            //     action: ApplicationCommands.CREATELAYER,
            //     parameters: {
            //         layerType: LayerTypes.WMSLayer,
            //         model: {
            //             getMapRoot: "https://sampleservices.luciad.com/wms",
            //             version: "1.3.0",
            //             referenceText: "EPSG:3857",
            //             layers: ["4ceea49c-3e7c-4e2d-973d-c608fb2fb07e"],
            //             transparent: false,
            //         },
            //         layer: {
            //             label: "Los angeles",
            //             visible: true,
            //         },
            //         autoZoom: false
            //     }
            // })
           // executeCommand(command);
        }
    }

    const className = "LuciadMap"+ (typeof props.className !== "undefined" ? " " + props.className : "");

    const closePanorama = () => {
        if (map.current && (map.current as any)._myPanoramaActions) {
            const panoActions = (map.current as any)._myPanoramaActions as PanoramaActions;
            panoActions.leavePanoramaMode()
        }
    }

    return <div id={props.id} className={className} ref={divEl}>
        <ZoomControlMini map={map.current} />
        <CompassButton map={map.current}/>
        <MouseCoordinateReadout map={map.current} reference={map.current?.reference}  />
        {showLeaveButton &&
            <div style={{width:"100%", height:"100%", backgroundColor: "transparent", position: "absolute", top:0, left:0, padding:10, pointerEvents: "none",  textAlign: "center"}}>
                <Button variant="contained" onClick={closePanorama}  size="small" sx={{margin: "0 auto", pointerEvents: "all"}}>Close Panorama</Button>
            </div>
        }
        {props.children}
    </div>
}

export {
    LuciadMap
}