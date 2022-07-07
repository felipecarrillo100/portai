import React, {useEffect} from "react";
import {
    Divider,
    Grid,
} from "@mui/material";
import {Map} from "@luciad/ria/view/Map";
import {FormProps} from "../interfaces";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {useSelector} from "react-redux";
import TreeNodeInterface from "../../interfaces/TreeNodeInterface";
import {IAppState} from "../../reduxboilerplate/store";
import {LayerControl} from "../../components/LayerControl/LayerControl";

interface StateProps {
    treeNode: TreeNodeInterface | null;
    currentLayerId: string | null;
    map: Map | null;
}

const LayerControlForm = (props: FormProps) =>{
    const {closeForm} = props;

    const { treeNode, map , currentLayerId} = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            treeNode: state.luciadMap.treeNode,
            map: state.luciadMap.map,
            currentLayerId: state.luciadMap.currentLayerId
        }
    });

    useEffect(()=>{
        // Init
        console.log("Init");
        return ()=>{
            // Init
            console.log("Destroy");
        }
    }, [])

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        if(closeForm) closeForm();
    }

    return (
        <Box component="form" onSubmit={onSubmit}
             noValidate
             autoComplete="off"
        >
            <Typography variant="h6" align="center" margin="dense">
                Available Layers
            </Typography>
            <Grid container spacing={1}>
                <Grid item xs={12} sm={12}>
                    <LayerControl rootNode={treeNode} map={map} />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Divider variant="middle" />
                </Grid>
            </Grid>
        </Box>
    )
};

export {
    LayerControlForm
}