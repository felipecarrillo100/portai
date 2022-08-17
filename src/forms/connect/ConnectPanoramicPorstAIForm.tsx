import {useDispatch} from "react-redux";
import React, {useEffect, useState} from "react";
import {CreateCommand} from "../../commands/CreateCommand";
import {ApplicationCommands} from "../../commands/ApplicationCommands";
import {LayerTypes} from "../../components/luciad/layertypes/LayerTypes";
import {SetAppCommand} from "../../reduxboilerplate/command/actions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Divider, Grid, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import {FormProps} from "../interfaces";
import styled from "@emotion/styled";

//const url = "http://localhost/panoramics/json/features.json";
const url = "/pano/features.json";

const DivButtons = styled('div')`
  float: right;
`;

const styles = {
    button: {
        marginLeft: "10px"
    }
}

interface Props extends FormProps {
    default?: string;
}

const ConnectPanoramicPorstAIForm = (props: Props) =>{
    const dispatch = useDispatch();
    const {closeForm} = props;

    const [inputs, setInputs] = useState({
        url: url,
        label: "Panoramas",
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
                layerType: LayerTypes.PanoramicPortAILayer,
                model: {
                    target: inputs.url,
                },
                layer: {
                    visible: true,
                    label: inputs.label,
                    selectable: true,
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
                Connect to Panorama
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
    ConnectPanoramicPorstAIForm
}