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
import {FormProps} from "../interfaces";
import {LTSCapabilitiesCoverage} from "@luciad/ria/model/capabilities/LTSCapabilitiesCoverage";
import {LTSCapabilities} from "@luciad/ria/model/capabilities/LTSCapabilities";
import {BoundsObject} from "../../commands/ConnectCommands";

const DivButtons = styled('div')`
  float: right;
`;

const styles = {
    button: {
        marginLeft: "10px"
    }
}

const ConnectLTSForm = (props: FormProps) =>{
    const dispatch = useDispatch();

    const [inputs, setInputs] = useState({
        url: "https://sampleservices.luciad.com/lts",
        label: "",
        id: "",
    });

    const [layers, setLayers] = useState([] as LTSCapabilitiesCoverage[]);

    const {closeForm} = props;

    const handleChange = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};

        if (name==="id") {
            const layer = layers.find(l=>l.id === value);
            if (layer) {
                newInputs.id = value;
                newInputs.label = layer.name;
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
        LTSCapabilities.fromURL(request, options).then((result) => {
            if (result.coverages.length>0) {
                const newInputs =  inputs;
                newInputs.id = result.coverages[0].id;
                newInputs.label = result.coverages[0].name;
                setInputs(newInputs);
            }
            setLayers(result.coverages);
        })
    }

    const getLayerBounds = (layer: LTSCapabilitiesCoverage) =>{
        const e: BoundsObject = {
            coordinates:[], reference:""
        }
        const bounds = layer.getBounds();
        if (bounds && bounds.reference) {
            const r : BoundsObject = {
                coordinates: [bounds.x, bounds.width, bounds.y, bounds.height],
                reference: bounds.reference.identifier
            }
            return r;
        }
        return e;
    }

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        const layer = layers.find(l=>l.id === inputs.id);

        if (layer) {
            const command = CreateCommand({
                action: ApplicationCommands.CREATELAYER,
                parameters: {
                    layerType: LayerTypes.LTSLayer,
                    model: {
                        coverageId: layer.id,
                        referenceText: layer.referenceName,
                        boundsObject: getLayerBounds(layer),
                        level0Columns: layer.level0Columns,
                        level0Rows: layer.level0Rows,
                        tileWidth: layer.tileWidth,
                        tileHeight: layer.tileHeight,
                        dataType: layer.type,
                        samplingMode: layer.samplingMode,
                        url: inputs.url
                    },
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
    }

    const getPreferredFormat = (outputFormats: string[]) => {
        if (outputFormats.find(e=>e==="application/json"))
            return "application/json";
        return outputFormats[0];
    }


    const renderLayers = layers.map((l)=>(
        <MenuItem value={l.id} key={l.id}>{l.name}</MenuItem>
    ));

    return (
        <Box component="form" onSubmit={onSubmit}

             noValidate
             autoComplete="off"
        >
            <Typography variant="h6" align="center" margin="dense">
                Connect to LTS
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
                            value={inputs.id}
                            label="Layers"
                            name="id"
                            onChange={handleChange}
                            input={<OutlinedInput label="Layers" />}
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
    ConnectLTSForm
}