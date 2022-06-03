import React, {useEffect, useState} from "react";
import {
    Divider, FormControl,
    Grid, InputLabel, OutlinedInput, Select,
    TextField
} from "@mui/material";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import styled from "@emotion/styled";
import MenuItem from "@mui/material/MenuItem";
import {CreateCommand} from "../../commands/CreateCommand";
import {ApplicationCommands} from "../../commands/ApplicationCommands";
import {LayerTypes} from "../../components/luciad/layertypes/LayerTypes";
import {SetAppCommand} from "../../reduxboilerplate/command/actions";
import {useDispatch} from "react-redux";
import {WFSCapabilities} from "@luciad/ria/model/capabilities/WFSCapabilities";
import {WFSCapabilitiesFeatureType} from "@luciad/ria/model/capabilities/WFSCapabilitiesFeatureType";
import {FormProps} from "../interfaces";


const DivButtons = styled('div')`
  float: right;
`;

const styles = {
    button: {
        marginLeft: "10px"
    }
}

const ConnectWFSForm = (props: FormProps) =>{
    const dispatch = useDispatch();

    const [inputs, setInputs] = useState({
        url: "https://sampleservices.luciad.com/wfs",
        label: "",
        layer: "Press Get Layers Button",
        format: "Press Get Layers Button",
    });

    const [layers, setLayers] = useState([] as WFSCapabilitiesFeatureType[]);
    const [formats, setFormats] = useState([] as string[])

    const {closeForm} = props;

    const handleChange = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};

        if (name==="layer") {
            const layer = layers.find(l=>l.name === value);
            if (layer) {
                newInputs.layer = value;
                newInputs.label = layer.title;
                newInputs.format = getPreferredFormat(layer.outputFormats);
                setFormats(layer.outputFormats);
            }
        } else {
            // @ts-ignore
            newInputs[name] = value;
        }
        setInputs(newInputs);
    };


    useEffect(()=>{
        // Init
        return ()=>{
            // Init
        }
    }, []);

    const getLayers = () => {
        const request = inputs.url;
        const options = {}
        WFSCapabilities.fromURL(request, options).then((result) => {
            if (result.featureTypes.length>0) {
                setTimeout(()=>{
                    const newInputs = {...inputs} ;
                    newInputs.layer = result.featureTypes[0].name;
                    newInputs.label = result.featureTypes[0].title;
                    newInputs.format = getPreferredFormat(result.featureTypes[0].outputFormats);
                    setInputs(newInputs);
                })
                setFormats(result.featureTypes[0].outputFormats);
            }
            setLayers(result.featureTypes);
        })
    }

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        const layer = layers.find(l=>l.name === inputs.layer);

        if (layer) {
            const nBounds = normalizeBounds(layer)
            const referenceText = layer.defaultReference;
            const command = CreateCommand({
                action: ApplicationCommands.CREATELAYER,
                parameters: {
                    layerType: LayerTypes.WFSLayer,
                    model: {
                        serviceURL: inputs.url,
                        typeName: inputs.layer,
                        referenceText
                    },
                    layer: {
                        label: inputs.label,
                        visible: true,
                        selectable: true
                    },
                    autoZoom: true,
                    fitBounds: nBounds
                }
            });
            dispatch(SetAppCommand(command));
            if(closeForm) closeForm();
        }
    }

    const getPreferredFormat = (outputFormats: string[]) => {
        if (outputFormats.find(e=>e==="application/json"))
            return "application/json";
        return outputFormats[0];
    }

    const normalizeBounds = (layer:WFSCapabilitiesFeatureType) => {
        const boundsArray = layer.getWGS84Bounds();
        if (boundsArray.length>0) {
            const bounds = boundsArray[0];
            const b = [bounds.x, bounds.width, bounds.y, bounds.height];
            // @ts-ignore
            return {coordinates: b, reference:bounds.reference.identifier};
        } else {
            const b = [-180, 360, -90, 180];
            return {coordinates: b, reference:"CRS:84"};
        }
    }


    const renderLayers = layers.map((l)=>(
        <MenuItem value={l.name} key={l.name}>{l.title}</MenuItem>
    ));

    const renderFormats = formats.map((f)=>(
        <MenuItem value={f} key={f}>{f}</MenuItem>
    ));

    return (
        <Box component="form" onSubmit={onSubmit}

             noValidate
             autoComplete="off"
        >
            <Typography variant="h6" align="center" margin="dense">
                Connect to WFS
            </Typography>
            <Grid container spacing={1}>
                <Grid item xs={12} sm={12}>
                    <TextField
                        value={inputs.url}
                        name="url"
                        size="small"
                        required
                        id="fullname"
                        label="Endpoint URL"
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <DivButtons>
                        <Button variant="contained" onClick={getLayers} sx={styles.button}  size="small">Get Layers</Button>
                    </DivButtons>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <FormControl fullWidth size="small" required>
                        <InputLabel id="layer-select-id" >Layers</InputLabel>
                        <Select
                            labelId="layer-select-id"
                            value={inputs.layer}
                            label="Layers"
                            name="layer"
                            onChange={handleChange}
                            input={<OutlinedInput label="Name" />}
                        >
                            {renderLayers}
                        </Select>
                    </FormControl>
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
                    <FormControl fullWidth size="small" required>
                        <InputLabel id="format-select-id" >Format</InputLabel>
                        <Select
                            labelId="format-select-id"
                            value={inputs.format}
                            label="Select Format"
                            name="format"
                            onChange={handleChange}
                            input={<OutlinedInput label="Format" />}
                        >
                            {renderFormats}
                        </Select>
                    </FormControl>
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
    ConnectWFSForm
}