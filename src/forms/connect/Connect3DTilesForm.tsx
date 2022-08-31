import {useDispatch} from "react-redux";
import React, {useEffect, useRef, useState} from "react";
import {CreateCommand} from "../../commands/CreateCommand";
import {ApplicationCommands} from "../../commands/ApplicationCommands";
import {LayerTypes} from "../../components/luciad/layertypes/LayerTypes";
import {SetAppCommand} from "../../reduxboilerplate/command/actions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
    Checkbox,
    Divider,
    FormControlLabel,
    Grid,
    Slider,
    TextField
} from "@mui/material";
import Button from "@mui/material/Button";
import {FormProps} from "../interfaces";
import styled from "@emotion/styled";
import {TileLoadingStrategy} from "@luciad/ria/view/tileset/TileSet3DLayer";

const url = "http://localhost:8081/ogc/3dtiles/uw_pw_gesamt_point_cloud_new/tileset.json";

const DivButtons = styled('div')`
  float: right;
`;

const styles = {
    button: {
        marginLeft: "10px"
    }
}

const DefaultOffsetTerrain = true;
const DefaultLoadingStrategy = TileLoadingStrategy.OVERVIEW_FIRST;

interface Props extends FormProps {
    default?: string;
    label?: string;
    isPointCloud?: boolean;
    offsetTerrain?: boolean;
}

const Connect3DTilesForm = (props: Props) =>{
    const dispatch = useDispatch();
    const {closeForm} = props;

    const [inputs, setInputs] = useState({
        url: url,
        label: props.label ? props.label : props.isPointCloud ? "Point Cloud" :"3D Mesh",
        qualityFactor: 0.6,
        offsetTerrain: typeof props.offsetTerrain !== "undefined" ? props.offsetTerrain : DefaultOffsetTerrain,
        features: "",
        isPointCloud: props.isPointCloud ? true : false
    });

    useEffect(()=>{
        if (props.default) {
            setInputs({...inputs, url: props.default});
        }
    }, [props])

    const pageTitle = "Connect to 3D Tiles";


    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        const command = CreateCommand({
            action: ApplicationCommands.CREATELAYER,
            parameters: {
                layerType: LayerTypes.OGC3DTilesLayer,
                model: {
                    url: inputs.url,
                    featuresUrl: inputs.features.length > 0 ? inputs.features : undefined,
                },
                layer: {
                    transparency: true,
                    idProperty: "FeatureID",
                    loadingStrategy: DefaultLoadingStrategy,
                    label: inputs.label,
                    visible: true,
                    offsetTerrain: inputs.offsetTerrain,
                    qualityFactor: inputs.qualityFactor,
                    isPointCloud: inputs.isPointCloud,
                },
                autoZoom: true
            }
        });
        dispatch(SetAppCommand(command));
        if(closeForm) closeForm();
    }

    const handleChange = (event: any) => {
        const {name, value} = event.target;
        const realValue = event.target.type === 'checkbox' ? event.target.checked : value;

        const newInputs = {...inputs};
        if (name==="url") {
            if (newInputs.isPointCloud === false){
                if (value.indexOf("/ogc/3dtiles/") >-1 && value.indexOf("_geometry/tileset.json")>-1) {
                    const featureUrl = value.replace("/ogc/3dtiles/", "/ogc/wfs/").replace("_geometry/tileset.json", "_features") ;
                    newInputs.features = featureUrl;
                }
            }
            // @ts-ignore
            newInputs[name] = value;
            setInputs(newInputs);
        } else {
            // @ts-ignore
            newInputs[name] = realValue;
            setInputs(newInputs);
        }
    }

    console.log("Point Cloud: " + inputs.isPointCloud)
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
                    <FormControlLabel control={<Checkbox checked={inputs.offsetTerrain} onChange={handleChange} name="offsetTerrain"/>} label="Offset Terrain" />
                </Grid>
                {/*
                     <Grid item xs={12} sm={12}>
                    <FormControlLabel control={<Checkbox checked={inputs.isPointCloud} onChange={handleChange}  name="isPointCloud"/>} label="Is Pointcloud" />
                </Grid>
                */}

                {inputs.isPointCloud! ?
                    <></> :
                    <Grid item xs={12} sm={12}>
                        <TextField
                        value={inputs.features}
                        name="features"
                        size="small"
                        required
                        id="featuresStore"
                        label="Features Endpoint"
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                        />
                    </Grid>
                }
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