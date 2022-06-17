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

const url = "http://localhost:8081/ogc/3dtiles/uw_pw_gesamt_point_cloud_new/tileset.json\n";

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

const Connect3DTilesForm = (props: Props) =>{
    const dispatch = useDispatch();
    const {closeForm} = props;

    const [inputs, setInputs] = useState({
        url: url,
        label: props.label ? props.label : "3D Mesh",
        qualityFactor: 0.6
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
                layerType: LayerTypes.OGC3DTilesLayer,
                model: {
                    url: inputs.url,
                },
                layer: {
                    transparency: true,
                    idProperty: "FeatureID",
                    loadingStrategy: DefaultLoadingStrategy,
                    label: inputs.label,
                    visible: true,
                    offsetTerrain: typeof props.offsetTerrain !== "undefined" ? props.offsetTerrain: DefaultOffsetTerrain,
                    qualityFactor: inputs.qualityFactor
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

    return (
        <Box component="form" onSubmit={onSubmit}
             noValidate
             autoComplete="off"
        >
            <Typography variant="h6" align="center" margin="dense">
                Connect to 3D Tiles
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
                    <Typography id="non-linear-slider" gutterBottom>
                        Quality Factor: {inputs.qualityFactor}
                    </Typography>
                    <Slider
                        onChange={handleChange}
                        aria-labelledby="non-linear-slider"
                        min={0}
                        step={0.1}
                        max={2}
                        size="small"
                        value={inputs.qualityFactor}
                        name="qualityFactor"
                        aria-label="Small"
                        valueLabelDisplay="auto"
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
    Connect3DTilesForm
}