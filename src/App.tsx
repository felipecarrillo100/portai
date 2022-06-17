import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {AppContent} from "./components/AppContent";
import {FormHolder, FormHolders, FormManager} from "./components/holders/FormHolder";
import {Map} from "@luciad/ria/view/Map";
import {AdvancedNavBar} from "./components/navbar/AdvancedNavBar";
import {LuciadMap} from "./components/luciad/LuciadMap";
import {useDispatch, useSelector} from "react-redux";
import {IAppState} from "./reduxboilerplate/store";
import {ApplicationCommandsTypes} from "./commands/ApplicationCommandsTypes";
import {SetLuciadMap, SetLuciadMapCurrentlayer, SetLuciadMapTreeNode} from "./reduxboilerplate/luciadmap/actions";
import TreeNodeInterface from "./interfaces/TreeNodeInterface";
import {LayerConnectCommandsTypes} from "./commands/ConnectCommands";
import {FileUtils} from "./utils/FileUtils";
import {ApplicationCommands} from "./commands/ApplicationCommands";
import {TestForm} from "./forms/TestForm";
import {ConnectWMSForm} from "./forms/connect/ConnectWMSForm";
import {ConnectWFSForm} from "./forms/connect/ConnectWFSForm";
import {ConnectBingmapsForm} from "./forms/connect/ConnectBingmapsForm";
import {ConnectVOrthoPhotoForm} from "./forms/connect/ConnectVOrthoPhotoForm";
import {
    FeatureContextmenu,
    FeatureContextmenuExports
} from "./components/contextmenu/FeatureContextmenu";
import {ContextmenuRecords} from "./components/contextmenu/ContextmenuRecords";
import {SortableListForm} from "./forms/SortableListForm";
import {LayerControlForm} from "./forms/layercontrol/LayerControlForm";
import {CartesianMapForm} from "./forms/cartesian/CartesianMapForm";
import {Connect3DTilesForm} from "./forms/connect/Connect3DTilesForm";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {ConnectDronePhotoForm} from "./forms/connect/ConnectDronePhotoForm";
import {ConnectLTSForm} from "./forms/connect/ConnectLTSForm";
import {ConnectWMTSForm} from "./forms/connect/ConnectWMTSForm";
import {ToolsHolder} from "./components/holders/ToolsHolder";
import {ConnectPanoramicForm} from "./forms/connect/ConnectPanoramicForm";
import {ConnectPanoramicPorstAIForm} from "./forms/connect/ConnectPanoramicPorstAIForm";
import {FullScreen} from "./utils/fullscreen/FullScreen";


interface StateProps {
    proj: string;
    command: ApplicationCommandsTypes | null;
    map: Map | null;
}

const defaultFilename = "noname.wsp";

const App: React.FC = () => {
    const dispatch = useDispatch();
    const [toolbarVisible, setToolbarVisible] = useState(true);
    const [workspaceName, setWorkspaceName ] = useState(defaultFilename);
    const myContextMenu = useRef<FeatureContextmenuExports>(null);
    const contextMenuAnchorRef = useRef<HTMLDivElement>(null);

    const { proj, command, map} = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            proj: state.luciadMap.proj,
            command: state.appCommand.command,
            map: state.luciadMap.map,
        }
    });

    useEffect(()=>{
        if (myContextMenu.current) {
            ContextmenuRecords.recordMapContextmenu(myContextMenu.current)
        }
    }, [myContextMenu.current])

    const createForm = (parameters: { formName: string; data?: any }) => {
        switch (parameters.formName) {
            case "ConnectWMS":
                FormManager.openForm(FormHolders.LEFT, <ConnectWMSForm  />)
                break;
            case "ConnectLTS":
                FormManager.openForm(FormHolders.LEFT, <ConnectLTSForm />)
                break;
            case "ConnectWMTS":
                FormManager.openForm(FormHolders.LEFT, <ConnectWMTSForm />)
                break;
            case "ConnectWFS":
                FormManager.openForm(FormHolders.LEFT, <ConnectWFSForm />)
                break;
            case "ConnectBingmaps":
                FormManager.openForm(FormHolders.LEFT, <ConnectBingmapsForm />)
                break;
            case "Connect3DTilesForm":
                if (parameters.data){
                    FormManager.openForm(FormHolders.LEFT, <Connect3DTilesForm default={parameters.data.url}/>)
                } else {
                    FormManager.openForm(FormHolders.LEFT, <Connect3DTilesForm />)
                }
                break;
            case "ConnectVOrthophoto":
                FormManager.openForm(FormHolders.LEFT, <ConnectVOrthoPhotoForm />)
                break;
            case "DronePhoto":
                FormManager.openForm(FormHolders.LEFT, <ConnectDronePhotoForm />)
                break;
            case "LayerControlForm":
                FormManager.openForm(FormHolders.RIGHT, <LayerControlForm />)
                break;
            case "ShowTools":
                setToolbarVisible(true);
                break;
            case "CartesianMapForm":
                if (parameters.data) {
                    const feature = parameters.data.feature as Feature;
                    const type = parameters.data.type as string;
                    FormManager.openForm(FormHolders.BOTTOM, <CartesianMapForm feature={feature} type={type}/>)
                }
                break;
            case "ConnectPanorama":
                FormManager.openForm(FormHolders.LEFT, <ConnectPanoramicForm />)
                break;
            case "ConnectPanoramaProtAI":
                FormManager.openForm(FormHolders.LEFT, <ConnectPanoramicPorstAIForm />)
                break;
        }
    }

    useEffect(()=>{
        if (command) {
            switch (command.action) {
                case ApplicationCommands.CREATE_APP_FORM:
                    createForm(command.parameters);
                    break;
                case ApplicationCommands.TOGGLE_FULL_SCREEN:
                    const elem = document.body;
                    const fullScreen = !FullScreen.isFullscreen();
                    fullScreen ? FullScreen.requestFullscreen(elem) : FullScreen.cancelFullscreen();
                    break;
            }
        }
    }, [command] );

    const storeMapToRedux = (map: Map | null) => {
        dispatch(SetLuciadMap(map));
    }

    const storeTreeNodeToRedux = (node: TreeNodeInterface | null) => {
        dispatch(SetLuciadMapTreeNode(node));
    }

    const storeCurrentLayerToRedux = (layerId: string | null) => {
        dispatch(SetLuciadMapCurrentlayer(layerId));
    }

    const onSaveMap = (mapStatus: { mapState: any; proj: string; layerCommand: LayerConnectCommandsTypes } | null) => {
        if (mapStatus) {
            console.log(mapStatus);
            FileUtils.download(JSON.stringify(mapStatus), workspaceName, "application/json");
        }
    }

    return (
        <div className="App" ref={contextMenuAnchorRef}>
            <AdvancedNavBar/>
            <div className="AppBody" >
                <AppContent>
                    <LuciadMap proj={proj} onMapChange={storeMapToRedux} command={command}  onLayersChange={storeTreeNodeToRedux} onCurrentLayersChange={storeCurrentLayerToRedux} onSaveMap={onSaveMap}/>
                </AppContent>
                <ToolsHolder visible={toolbarVisible} onClose={()=>setToolbarVisible(false)}/>
                <FormHolder id={FormHolders.LEFT} />
                <FormHolder id={FormHolders.RIGHT} />
                <FormHolder id={FormHolders.BOTTOM} />
                <FeatureContextmenu ref={myContextMenu} anchorEl={contextMenuAnchorRef.current} />
            </div>
        </div>
    );
}

export default App;
