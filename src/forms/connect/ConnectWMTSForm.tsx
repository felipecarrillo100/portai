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
import {WMTSCapabilitiesLayer} from "@luciad/ria/model/capabilities/WMTSCapabilitiesLayer";
import {WMTSCapabilitiesTileMatrixSet} from "@luciad/ria/model/capabilities/WMTSCapabilitiesTileMatrixSet";
import {WMTSCapabilities} from "@luciad/ria/model/capabilities/WMTSCapabilities";

const DivButtons = styled('div')`
  float: right;
`;

const styles = {
    button: {
        marginLeft: "10px"
    }
}

const ConnectWMTSForm = (props: FormProps) =>{
    const dispatch = useDispatch();

    const [inputs, setInputs] = useState({
        url: "https://sampleservices.luciad.com/wmts",
        label: "",
        layer: "Press Get Layers Button",
        format: "Press Get Layers Button",
        tileMatrixSet: "Press Get Layers Button",
    });

    const [layers, setLayers] = useState([] as WMTSCapabilitiesLayer[]);
    const [tileMatrixSets, setTileMatrixSets] = useState([] as WMTSCapabilitiesTileMatrixSet[])
    const [formats, setFormats] = useState([] as string[])

    const {closeForm} = props;

    const handleChange = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};

        if (name==="layer") {
            const layer = layers.find(l=>l.identifier === value);
            if (layer) {
                newInputs.layer = value;
                newInputs.label = layer.title;
                newInputs.format = getPreferredFormat(layer.formats);
                newInputs.tileMatrixSet = getPreferredMatrixSet(layer.tileMatrixSets);
                setInputs(newInputs);
                setTileMatrixSets(layer.tileMatrixSets);
                setFormats(layer.formats);
            }
        } else {
            // @ts-ignore
            newInputs[name] = value;
            setInputs(newInputs);
        }
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
        WMTSCapabilities.fromURL(request, options).then((result) => {
            if (result.layers.length>0) {
                const layer = result.layers[0];
                setTimeout(()=>{
                    const cInputs =  {...inputs};
                    cInputs.layer = layer.identifier;
                    cInputs.label = layer.title;
                    cInputs.format = getPreferredFormat(layer.formats);
                    cInputs.tileMatrixSet = getPreferredMatrixSet(layer.tileMatrixSets);
                    setInputs(cInputs);
                });
                setTileMatrixSets(layer.tileMatrixSets);
                setFormats(layer.formats);
            } else {
                setTileMatrixSets([]);
                setFormats([]);
            }
            setLayers(result.layers);
        })
    }

    const matrixSetBounds = (reference: any) =>{
        const bounds = reference.bounds;
        const coordinates = [bounds.x, bounds.width, bounds.y, bounds.height];
        return {coordinates, reference: reference.identifier};
    }

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        const layer = layers.find(l=>l.identifier === inputs.layer);

        if (layer) {
            const tileMatrixSet = tileMatrixSets.find(l=>l.identifier === inputs.tileMatrixSet);
            let referenceText = "";
            if (tileMatrixSet) {
                referenceText = tileMatrixSet.referenceName;
                const tileMatrices = tileMatrixSet.tileMatrices;
                const tileMatricesIdxList = tileMatrices.map((el) => el.identifier );
                const tileMatricesLimitsList = tileMatrices.map((el) => el.limits );
                const boundsObject = matrixSetBounds(tileMatrixSet.getReference());
                const firstTileMatrix = tileMatrices[0];

                const command = CreateCommand({
                    action: ApplicationCommands.CREATELAYER,
                    parameters: {
                        layerType: LayerTypes.WMTSLayer,
                        model: {
                            url: inputs.url,
                            layer: inputs.layer,
                            tileMatrixSet: inputs.tileMatrixSet,
                            level0Columns: firstTileMatrix.matrixWidth,
                            level0Rows: firstTileMatrix.matrixHeight,
                            referenceText,
                            tileWidth: firstTileMatrix.tileWidth,
                            tileHeight: firstTileMatrix.tileHeight,
                            format: inputs.format,
                            tileMatrices: tileMatricesIdxList,
                            tileMatricesLimits: tileMatricesLimitsList,
                            levelCount: tileMatricesIdxList.length,
                            boundsObject,
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
    }

    const renderLayers = layers.map((l)=>(
        <MenuItem value={l.identifier} key={l.identifier}>{l.title}</MenuItem>
    ));

    const renderFormats = formats.map((f)=>(
        <MenuItem value={f} key={f}>{f}</MenuItem>
    ));

    const renderTileMatrixSet = tileMatrixSets.map((f)=>(
        <MenuItem value={f.identifier} key={f.identifier}>{f.title}</MenuItem>
    ));

    const getPreferredFormat = (outputFormats: string[]) => {
        if (outputFormats.find(e=>e==="application/json"))
            return "application/json";
        return outputFormats[0];
    }

    const getPreferredMatrixSet = (items: WMTSCapabilitiesTileMatrixSet[]) => {
        if (items.find(f=>f.identifier==="GoogleMapsCompatible"))
            return "GoogleMapsCompatible";
        return items[0].identifier;
    }


    return (
        <Box component="form" onSubmit={onSubmit}
             noValidate
             autoComplete="off"
        >
            <Typography variant="h6" align="center" margin="dense">
                Connect to WMTS
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
                    <FormControl fullWidth size="small" required>
                        <InputLabel id="format-select-id" >Format</InputLabel>
                        <Select
                            labelId="format-select-id"
                            value={inputs.tileMatrixSet}
                            label="Select Format"
                            name="tileMatrixSet"
                            onChange={handleChange}
                            input={<OutlinedInput label="Format" />}
                        >
                            {renderTileMatrixSet}
                        </Select>
                    </FormControl>
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
    ConnectWMTSForm
}