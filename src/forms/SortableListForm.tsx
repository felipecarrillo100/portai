import React, {useEffect, useState} from "react";
import {
    Divider,
    FormControl,
    Grid,
    InputLabel,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    Switch,
    TextField
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import {FormProps} from "./interfaces";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import styled from "@emotion/styled";
import {BingMapsImagerySet} from "../commands/ConnectCommands";
import {CreateCommand} from "../commands/CreateCommand";
import {ApplicationCommands} from "../commands/ApplicationCommands";
import {LayerTypes} from "../components/luciad/layertypes/LayerTypes";
import {SetAppCommand} from "../reduxboilerplate/command/actions";
import DraggableList from "../components/draggable/DraggableList";
import {DropResult} from "react-beautiful-dnd";
import {getItems, reorder} from "./helpres";
const DivButtons = styled('div')`
  float: right;
`;
const styles = {
    button: {
        marginLeft: "10px"
    }
}

const SortableListForm = (props: FormProps) =>{
    const {closeForm} = props;
    const [items, setItems] = React.useState(getItems(10));

    useEffect(()=>{
        // Init
        console.log("Init");
        return ()=>{
            // Init
            console.log("Destroy");
        }
    }, [])

    const onDragEnd = ({ destination, source }: DropResult) => {
        // dropped outside the list
        if (!destination) return;
        const newItems = reorder(items, source.index, destination.index);
        setItems(newItems);
    };

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
                    <DraggableList items={items} onDragEnd={onDragEnd} />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Divider variant="middle" />
                </Grid>
            </Grid>
        </Box>
    )
};

export {
    SortableListForm
}