import React, {useEffect, useState} from "react";
import {
    Divider,
    Grid,
} from "@mui/material";
import {Map} from "@luciad/ria/view/Map";
import {FormProps} from "../interfaces";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import styled from "@emotion/styled";
import {DropResult} from "react-beautiful-dnd";
import DraggableLayerControl from "./DraggableLayerControl";
import {useDispatch, useSelector} from "react-redux";
import TreeNodeInterface from "../../interfaces/TreeNodeInterface";
import {IAppState} from "../../reduxboilerplate/store";
import {AdvanceLayerTools} from "../../components/luciad/layerutils/AdvanceLayerTools";
const DivButtons = styled('div')`
  float: right;
`;

interface StateProps {
    treeNode: TreeNodeInterface | null;
    currentLayerId: string | null;
    map: Map | null;
}


const LayerControlForm = (props: FormProps) =>{
    const {closeForm} = props;
    const dispatch = useDispatch();


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

    const reorder = (source: number, destination: number) => {
        console.log(`Source: ${source}   Destination: ${destination}`);
        if (map && treeNode && (source!==destination)) {
            const revertedArray = [...treeNode.nodes].reverse();
            const targetNode = AdvanceLayerTools.getLayerTreeNodeByID(map, revertedArray[source].id);
            const referenceNode = AdvanceLayerTools.getLayerTreeNodeByID(map, revertedArray[destination].id);

            if (targetNode && referenceNode) {
                if (destination==revertedArray.length-1) {
                    map.layerTree.moveChild(targetNode, "bottom");
                    console.log("bottom: "+targetNode.label)
                } else if (destination===0) {
                    map.layerTree.moveChild(targetNode, "top");
                    console.log("top: "+targetNode.label)
                } else if (source<destination) {
                    console.log("below: "+targetNode.label)
                    map.layerTree.moveChild(targetNode, "below", referenceNode);
                } else {
                    console.log("above: "+targetNode.label)
                    map.layerTree.moveChild(targetNode, "above", referenceNode);
                }
            }

        }
    }

    const onDragEnd = ({ destination, source }: DropResult) => {
        // dropped outside the list
        if (!destination) return;
        reorder(source.index, destination.index);
    };

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        if(closeForm) closeForm();
    }

    const layers = treeNode && map ? [...treeNode.nodes].reverse() : [];
    console.log("Render")

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
                    <DraggableLayerControl items={layers} onDragEnd={onDragEnd} map={map} />
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