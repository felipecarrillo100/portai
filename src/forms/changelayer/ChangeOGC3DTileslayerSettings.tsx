import React, {ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Divider, FormControl, Grid, InputLabel, OutlinedInput, Select, Slider, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import {FormProps} from "../interfaces";
import styled from "@emotion/styled";
import {Map} from "@luciad/ria/view/Map";
import {TileSet3DLayer} from "@luciad/ria/view/tileset/TileSet3DLayer";
import {PointCloudPointShape} from "@luciad/ria/view/style/PointCloudPointShape";
import MenuItem from "@mui/material/MenuItem";
import {ScalingMode} from "@luciad/ria/view/style/ScalingMode";
import LayerFactory from "../../components/luciad/factories/LayerFactory";

const defaultLabel = "Layer Group";

const DivButtons = styled('div')`
  float: right;
`;

const styles = {
    button: {
        marginLeft: "10px"
    }
}

interface Props extends FormProps {
    map: Map;
    layer: TileSet3DLayer;
}

const ChangeOGC3DTileslayerSettings = forwardRef((props: Props, ref:ForwardedRef<any>) =>{

    const restoreValues = useRef<boolean>(true);
    const {closeForm} = props;

    const layer = props.layer as any;
    const [inputs, setInputs] = useState({
        label: props.layer.label,
        qualityFactor: layer.restoreCommand.parameters.layer.qualityFactor,
        scalingMode: layer.restoreCommand.parameters.layer.pointCloudStyle.scalingMode as (ScalingMode),
        pointShape: layer.restoreCommand.parameters.layer.pointCloudStyle.pointShape as (PointCloudPointShape),
        scaleFactor: layer.restoreCommand.parameters.layer.pointCloudStyle.scale.value as number
    });

    useEffect(() => {
        return ()=>{}
    }, []);

    const canClose = () => {
        if (restoreValues.current) {
            console.log("Cancelling on going changes!");
            LayerFactory.applyPointCloudStyle(layer, layer.restoreCommand.parameters.layer.pointCloudStyle);
        }
        return true;
    }

    useImperativeHandle(ref, () => ({ canClose }), [ canClose ])


    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        layer.restoreCommand.parameters.layer.qualityFactor = inputs.qualityFactor;
        layer.restoreCommand.parameters.layer.pointCloudStyle.scalingMode = inputs.scalingMode;
        layer.restoreCommand.parameters.layer.pointCloudStyle.pointShape = inputs.pointShape;
        layer.restoreCommand.parameters.layer.pointCloudStyle.scale.value = inputs.scaleFactor;
        restoreValues.current = false;
        if(closeForm) closeForm();
    }

    const handleChange = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};
        if (name==="scalingMode") {
            // @ts-ignore
            newInputs[name] = value;
            setInputs(newInputs);
            if (props.layer.pointCloudStyle.pointSize) props.layer.pointCloudStyle.pointSize = {mode: value};
        } else
        if (name==="pointShape") {
            // @ts-ignore
            newInputs[name] = value;
            setInputs(newInputs);
            props.layer.pointCloudStyle.pointShape = value;
        } else
        if (name==="scaleFactor") {
            // @ts-ignore
            newInputs[name] = value;
            setInputs(newInputs);
            layer.currentExpression.scaleExpression.update(Number(value));
        } else
        if (name==="qualityFactor") {
            // @ts-ignore
            newInputs[name] = value;
            setInputs(newInputs);
            props.layer.qualityFactor = value;
        } else {
            // @ts-ignore
            newInputs[name] = value;
            setInputs(newInputs);
        }
    }

    const selectShape  = [
        {value: PointCloudPointShape.SPHERE, label: "Sphere"},
        {value: PointCloudPointShape.DISC, label: "Disc"},
    ]

    const scalingMode = [
        {value: ScalingMode.ADAPTIVE_WORLD_SIZE, label: "Adaptive world size"},
        {value: ScalingMode.PIXEL_SIZE, label: "Pixel size"},
        {value: ScalingMode.WORLD_SIZE, label: "World size"},
    ]

    return (
        <Box component="form" onSubmit={onSubmit}
             noValidate
             autoComplete="off"
        >
            <Typography variant="h6" align="center" margin="dense">
                Change OGC 3DTiles settings
            </Typography>
            <Grid container spacing={1}>
                <Grid item xs={12} sm={12}>
                    <TextField
                        value={inputs.label}
                        name="label"
                        fullWidth
                        size="small"
                        required
                        id="outlined-required"
                        label="Layer"
                        inputProps={
                            { readOnly: true, }
                        }
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Typography id="non-linear-slider" gutterBottom>
                        Quality Factor: {inputs.qualityFactor}
                    </Typography>
                    <Slider
                        onChange={handleChange}
                        aria-labelledby="non-linear-slider"
                        min={0.1}
                        step={0.1}
                        max={2}
                        size="small"
                        value={inputs.qualityFactor}
                        name="qualityFactor"
                        aria-label="Small"
                        valueLabelDisplay="auto"
                    />
                </Grid>
                <Grid item xs={6} sm={6}>
                    <FormControl fullWidth size="small" required>
                        <InputLabel id="layer-select-id" >Shape</InputLabel>
                        <Select
                            labelId="layer-select-id"
                            value={inputs.pointShape}
                            label="Shape"
                            name="pointShape"
                            onChange={handleChange}
                            input={<OutlinedInput label="Shape" />}
                        >
                            {
                                selectShape.map((l)=>(
                                    <MenuItem value={l.value} key={l.value}>{l.label}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6} sm={6}>
                    <FormControl fullWidth size="small" required>
                        <InputLabel id="layer-select-id" >Scaling Mode</InputLabel>
                        <Select
                            labelId="layer-select-id"
                            value={inputs.scalingMode}
                            label="Scaling mode"
                            name="scalingMode"
                            onChange={handleChange}
                            input={<OutlinedInput label="Scaling Mode" />}
                        >
                            {
                                scalingMode.map((l)=>(
                                    <MenuItem value={l.value} key={l.value}>{l.label}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <Typography id="non-linear-slider" gutterBottom>
                        Scale Factor: {inputs.scaleFactor}
                    </Typography>
                    <Slider
                        onChange={handleChange}
                        aria-labelledby="non-linear-slider"
                        min={layer.restoreCommand.parameters.layer.pointCloudStyle.scale.range.minimum}
                        step={0.1}
                        max={layer.restoreCommand.parameters.layer.pointCloudStyle.scale.range.maximum}
                        size="small"
                        value={inputs.scaleFactor}
                        name="scaleFactor"
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
});


export {
    ChangeOGC3DTileslayerSettings
}