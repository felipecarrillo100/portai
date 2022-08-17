import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Divider, Grid, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import {FormProps} from "../interfaces";
import styled from "@emotion/styled";
// import ReactJson from 'react-json-view'
import ReactJSONEditor from "react-jsoneditor-wrapper";


const DivButtons = styled('div')`
  float: right;
`;

const styles = {
    button: {
        marginLeft: "10px"
    }
}


interface Props extends FormProps {
    feature?: any;
}

const DisplayBIMIFCFeature = (props: Props) => {
    const {closeForm} = props;

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        if(closeForm) closeForm();
    }

    return (
        <Box component="form" onSubmit={onSubmit}
             noValidate
             autoComplete="off"
        >
            <Typography variant="h6" align="center" margin="dense">
                Feature info
            </Typography>

            <Grid item xs={12} sm={12}>
                <TextField
                    variant="standard"
                    value={props.feature.id}
                    name="url"
                    size="small"
                    id="idname"
                    label="FeatureID"
                    fullWidth
                    margin="dense"
                    inputProps={
                        { readOnly: true, }
                    }
                />
            </Grid>

            <Grid container spacing={1}>
                <Grid item xs={12} sm={12}>
                    {/* <ReactJson src={props.feature.properties} /> */}
                    <ReactJSONEditor json={props.feature.properties} name="Properties" mode="view" modes={["view"]}/>
                </Grid>

                <Grid item xs={12} sm={12}>
                    <Divider variant="middle" />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <DivButtons>
                        <Button type="submit" variant="contained" sx={styles.button} size="small">Close</Button>
                    </DivButtons>
                </Grid>
            </Grid>
        </Box>
    )
};


export {
    DisplayBIMIFCFeature
}