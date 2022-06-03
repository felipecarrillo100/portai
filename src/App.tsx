import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {AppContent} from "./components/AppContent";
import {FormHolder, FormHolders, FormManager} from "./components/FormHolder";
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


interface StateProps {
    proj: string;
    command: ApplicationCommandsTypes | null;
    map: Map | null;
}

const defaultFilename = "noname.wsp";

const App: React.FC = () => {
    const dispatch = useDispatch();
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

    const createForm = (parameters: { formName: string }) => {
        switch (parameters.formName) {
            case "ConnectWMS":
                FormManager.openForm(FormHolders.LEFT, <ConnectWMSForm  />)
                break;
            case "ConnectWFS":
                FormManager.openForm(FormHolders.LEFT, <ConnectWFSForm />)
                break;
            case "ConnectBingmaps":
                FormManager.openForm(FormHolders.LEFT, <ConnectBingmapsForm />)
                break;
            case "ConnectVOrthophoto":
                FormManager.openForm(FormHolders.LEFT, <ConnectVOrthoPhotoForm />)
                break;
            case "SortableListForm":
                FormManager.openForm(FormHolders.LEFT, <SortableListForm />)
                break;
        }
    }

    useEffect(()=>{
        if (command) {
            switch (command.action) {
                case ApplicationCommands.CREATE_APP_FORM:
                    createForm(command.parameters);
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
                <FormHolder id={FormHolders.LEFT} />
                <FormHolder id={FormHolders.RIGHT} />
                <FeatureContextmenu ref={myContextMenu} anchorEl={contextMenuAnchorRef.current} />
            </div>
        </div>
    );
}

export default App;
