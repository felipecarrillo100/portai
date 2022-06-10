import {useDispatch} from "react-redux";
import React, {useEffect, useState} from "react";
import {WFSCapabilitiesFeatureType} from "@luciad/ria/model/capabilities/WFSCapabilitiesFeatureType";
import {WFSCapabilities} from "@luciad/ria/model/capabilities/WFSCapabilities";
import {CreateCommand} from "../../commands/CreateCommand";
import {ApplicationCommands} from "../../commands/ApplicationCommands";
import {LayerTypes} from "../../components/luciad/layertypes/LayerTypes";
import {SetAppCommand} from "../../reduxboilerplate/command/actions";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Divider, FormControl, Grid, InputLabel, OutlinedInput, Select, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import {FormProps} from "../interfaces";
import {BingMapsImagerySet} from "../../commands/ConnectCommands";
import styled from "@emotion/styled";

const myToken = "AugjqbGwtwHP0n0fUtpZqptdgkixBt5NXpfSzxb7q-6ATmbk-Vs4QnqiW6fhaV-i";

const DivButtons = styled('div')`
  float: right;
`;

const styles = {
    button: {
        marginLeft: "10px"
    }
}

const ConnectBingmapsForm = (props: FormProps) =>{
    const dispatch = useDispatch();
    const {closeForm} = props;

    const [inputs, setInputs] = useState({
        token: myToken,
        label: "Satellite",
        layer: BingMapsImagerySet.AERIAL as BingMapsImagerySet,
    });

    useEffect(()=>{
        const token = localStorage.getItem('bingmapsToken');
        if (token) {
            setTimeout(()=>{
                setInputs({...inputs, token});
            }, 10)
        }
        return ()=>{}
    }, []);

    const saveToken = () => {
        localStorage.setItem('bingmapsToken', inputs.token);
    }

    const loadToken = () => {
        const token = localStorage.getItem('bingmapsToken');
        if (token) setInputs({...inputs, token})
    }

    const [bingmapSet] = useState([
        {
            value: BingMapsImagerySet.AERIAL,
            title: "BingMaps Satellite"
        }, {
            value: BingMapsImagerySet.HYBRID,
            title: "BingMaps Hybrid"
        }, {
            value: BingMapsImagerySet.ROAD,
            title: "BingMaps Streets"
        }]);

    const pageTitle = "Connect to Bingmaps";


    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        const command = CreateCommand({
            action: ApplicationCommands.CREATELAYER,
            parameters: {
                layerType: LayerTypes.BingMapsLayer,
                model: {
                    token: inputs.token,
                    imagerySet: inputs.layer,
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


    const renderLayers =  bingmapSet.map((f)=>(
        <MenuItem value={f.value} key={f.value}>{f.title}</MenuItem>
    ));

    const token = inputs.token;
    console.log("token:" + token);

    const handleChange = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};
        // @ts-ignore
        newInputs[name] = value;
        if (name==="layer") {
            const dataSet = bingmapSet.find(e=>e.value===value);
            if (dataSet) newInputs.label = dataSet.title
        }
        setInputs(newInputs);
    }

    return (
        <Box component="form" onSubmit={onSubmit}

             noValidate
             autoComplete="off"
        >
            <Typography variant="h6" align="center" margin="dense">
                Connect to Bingmaps
            </Typography>
            <Grid container spacing={1}>
                <Grid item xs={12} sm={12}>
                    <TextField
                        value={inputs.token}
                        name="token"
                        size="small"
                        required
                        id="fullname"
                        label="Bingmaps Token"
                        fullWidth
                        margin="dense"
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <DivButtons>
                        <Button variant="contained" onClick={saveToken} sx={styles.button}  size="small">Store</Button>
                        <Button variant="contained" onClick={loadToken} sx={styles.button} size="small">Reload</Button>
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
    ConnectBingmapsForm
}