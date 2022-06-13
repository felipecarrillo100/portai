import React from "react";
import {ControllerToolSelector} from "./ControllerToolSelector";
import {EditTools} from "./EditTools";
import {Map} from "@luciad/ria/view/Map";
import {useSelector} from "react-redux";
import {IAppState} from "../../../reduxboilerplate/store";
import Typography from "@mui/material/Typography";



interface StateProps {
    map: Map | null;
    currentLayerId: string | null;
}

const ToolBar: React.FC = (  ) => {
    const { map, currentLayerId} = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            map: state.luciadMap.map,
            currentLayerId: state.luciadMap.currentLayerId
        }
    });

    return (<>
        <Typography variant="h6" align="center" margin="dense">
            Tools
        </Typography>
        <ControllerToolSelector map={map}/>
        <EditTools map={map} currentLayerId={currentLayerId}/>
    </>)
}

export {
    ToolBar
}