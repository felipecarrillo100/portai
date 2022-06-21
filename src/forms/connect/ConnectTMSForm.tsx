import {useDispatch} from "react-redux";
import React, {useEffect, useState} from "react";
import {CreateCommand} from "../../commands/CreateCommand";
import {ApplicationCommands} from "../../commands/ApplicationCommands";
import {LayerTypes} from "../../components/luciad/layertypes/LayerTypes";
import {SetAppCommand} from "../../reduxboilerplate/command/actions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Divider, FormControl, Grid, InputLabel, OutlinedInput, Select, Slider, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import {FormProps} from "../interfaces";
import styled from "@emotion/styled";
import {TileLoadingStrategy} from "@luciad/ria/view/tileset/TileSet3DLayer";
import {RasterDataType} from "@luciad/ria/model/tileset/RasterDataType";
import {RasterSamplingMode} from "@luciad/ria/model/tileset/RasterSamplingMode";
import MenuItem from "@mui/material/MenuItem";

const url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{-y}.png";

const DivButtons = styled('div')`
  float: right;
`;

const styles = {
    button: {
        marginLeft: "10px"
    }
}

const DefaultOffsetTerrain = false;
const DefaultLoadingStrategy = TileLoadingStrategy.OVERVIEW_FIRST;

interface Props extends FormProps {
    default?: string;
    label?: string;
    offsetTerrain?: boolean;
}

const ConnectTMSForm = (props: Props) =>{
    const dispatch = useDispatch();
    const {closeForm} = props;

    const [inputs, setInputs] = useState({
        url,
        label: "TMS Layer",
        domains: "a,b,c",
        levels: 22,
    });

    useEffect(()=>{
        if (props.default) {
            setInputs({...inputs, url: props.default});
        }
    }, [props.default])

    const pageTitle = "Connect to Bingmaps";


    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        const command = CreateCommand({
            action: ApplicationCommands.CREATELAYER,
            parameters: {
                layerType: LayerTypes.TMSLayer,
                model: {
                    baseURL: inputs.url,
                    subdomains: inputs.domains.split(","),
                    levelCount: inputs.levels            },
                layer: {
                    label: inputs.label,
                    visible: true,
                },
                autoZoom: true
            }
        });
        dispatch(SetAppCommand(command));
        if(closeForm) closeForm();
    }



    const handleChange = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};
        // @ts-ignore
        newInputs[name] = value;
        setInputs(newInputs);
    }

    const renderLevels = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].map((f)=>(
        <MenuItem value={f} key={f}>{f}</MenuItem>
    ));

    return (
        <Box component="form" onSubmit={onSubmit}
             noValidate
             autoComplete="off"
        >
            <Typography variant="h6" align="center" margin="dense">
                Connect to TMS
            </Typography>
            <Grid container spacing={1}>
                <Grid item xs={12} sm={12}>
                    <TextField
                        value={inputs.url}
                        name="url"
                        size="small"
                        required
                        id="fullname"
                        label="URL Endpoint"
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                    />
                </Grid>

                <Grid item xs={12} sm={12}>
                    <TextField
                        value={inputs.label}
                        name="label"
                        fullWidth
                        size="small"
                        required
                        id="outlined-required"
                        label="Label"
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <TextField
                        value={inputs.domains}
                        name="domains"
                        fullWidth
                        size="small"
                        required
                        id="outlined-required"
                        label="Domains"
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <TextField
                        type="number"
                        InputProps={{ inputProps: { min: 1, max: 22 } }}
                        value={inputs.levels}
                        name="levels"
                        fullWidth
                        size="small"
                        required
                        id="outlined-required"
                        label="Levels"
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Divider variant="middle" />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <DivButtons>
                        <Button variant="contained" onClick={closeForm} sx={styles.button}  size="small">Cancel</Button>
                        <Button type="submit" variant="contained" sx={styles.button} size="small">Submit</Button>
                    </DivButtons>
                </Grid>
            </Grid>
        </Box>
    )
};


export {
    ConnectTMSForm
}