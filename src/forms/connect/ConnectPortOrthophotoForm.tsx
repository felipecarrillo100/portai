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


const DivButtons = styled('div')`
  float: right;
`;

const styles = {
    button: {
        marginLeft: "10px"
    }
}


interface OrthophotoDataset {
    name: string;
    title: string;
}

const ConnectPortOrthophotoForm = (props: FormProps) =>{
    const dispatch = useDispatch();

    const [inputs, setInputs] = useState({
        dataset: "",
        label: "",
        targetJSON: "",
        photoJSON: ""
    });


    const [datasets, setDatasets] = useState([] as OrthophotoDataset[]);
    const {closeForm} = props;

    const handleChange = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};

        if (name==="dataset") {
            const dataset = datasets.find(l=>l.name === value);
            if (dataset) {
                const name = dataset.name;
                const targetJSON =  "./portInfo/" + name + "/Orthophotos.json";
                const photoJSON =  "./portInfo/" + name + "/Geotagged_Photos";
                newInputs.dataset = name;
                newInputs.label = dataset.title;
                newInputs.targetJSON = targetJSON;
                newInputs.photoJSON = photoJSON;
            }
        } else {
            // @ts-ignore
            newInputs[name] = value;
        }
        setInputs(newInputs);
    };


    const init = () => {
        loadAvailableDatasets();
    }

    const loadAvailableDatasets = () => {
        const request = "./portInfo/";
        fetch(request)
            .then(response => {
                return response.json();
            })
            .then(imageInfo => {
                const newDatasets: OrthophotoDataset[] = !imageInfo ? [] : imageInfo.map((e: any)=>({name: e.name, title: e.name}));
                setDatasets(newDatasets);
                if (newDatasets.length > 0) {
                    const name = newDatasets[0].name;
                    const targetJSON =  "./portInfo/" + name + "/Orthophotos.json";
                    const photoJSON =  "./portInfo/" + name + "/Geotagged_Photos";
                    setInputs({...inputs, dataset: name, label: name, targetJSON, photoJSON})
                }
            });
    }

    useEffect(()=>{
        // Init
        init();
        return ()=>{
            // Destroy
        }
    }, []);


    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        const dataset = datasets.find(l=>l.name === inputs.dataset);

        if (dataset) {
            const command = CreateCommand({
                action: ApplicationCommands.CREATELAYER,
                parameters: {
                    layerType: LayerTypes.PortOrthophotoLayer,
                    model: {
                        url: inputs.targetJSON
                    },
                    layer: {
                        label: inputs.label+ "(Orthophoto)",
                        visible: true,
                        selectable: true
                    },
                    autoZoom: true,
                }
            });
            dispatch(SetAppCommand(command));
            const command2 = CreateCommand({
                action: ApplicationCommands.CREATELAYER,
                parameters: {
                    layerType: LayerTypes.FeaturesGeoJSONPhotos,
                    model: {
                        url: inputs.photoJSON,
                    },
                    layer: {
                        label: inputs.label + "(Geotagged Photos)",
                        visible: true,
                        selectable: true
                    },
                    autoZoom: true,
                }
            });
            setTimeout(()=>{
                dispatch(SetAppCommand(command2));
            }, 50)
            if(closeForm) closeForm();
        }
    }


    const renderDataset =  datasets.map((l)=>(
        <MenuItem value={l.name} key={l.name}>{l.title}</MenuItem>
    ));

    return (
        <Box component="form" onSubmit={onSubmit}

             noValidate
             autoComplete="off"
        >
            <Typography variant="h6" align="center" margin="dense">
                Connect to Port Orthophoto
            </Typography>
            <Grid container spacing={1}>
                <Grid item xs={12} sm={12}>
                    <FormControl fullWidth size="small" required>
                        <InputLabel id="layer-select-id" >Available datasets</InputLabel>
                        <Select
                            labelId="layer-select-id"
                            value={inputs.dataset}
                            label="Datasets"
                            name="dataset"
                            onChange={handleChange}
                            input={<OutlinedInput label="Available datasets" />}
                        >
                            {renderDataset}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                    <DivButtons>
                        <Button variant="contained" onClick={loadAvailableDatasets} sx={styles.button}  size="small">Refresh</Button>
                    </DivButtons>
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
                    <TextField
                        value={inputs.targetJSON}
                        name="targetJSON"
                        fullWidth
                        size="small"
                        required
                        id="outlined-required"
                        label="JSON descriptor"
                        onChange={handleChange}
                        inputProps={
                            { readOnly: true}
                        }
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <TextField
                        value={inputs.photoJSON}
                        name="photoJSON"
                        fullWidth
                        size="small"
                        required
                        id="outlined-required"
                        label="Photo descriptor"
                        onChange={handleChange}
                        inputProps={
                            { readOnly: true }
                        }
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
    ConnectPortOrthophotoForm
}