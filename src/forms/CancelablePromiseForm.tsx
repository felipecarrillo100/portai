import React, {ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef} from "react";
import {FormControl, InputLabel, Select, SelectChangeEvent, Switch} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import {FormProps} from "./interfaces";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {CancellableAction, CancellablePromise} from "../utils/CancellablePromise";

const CancelablePromiseForm = forwardRef((props: FormProps, ref:ForwardedRef<any>) =>{
    const {closeForm} = props;
    const [cancelablePromise, setCancelablePromise] = React.useState(CancellablePromise.initValues);

    const runTest = () => {
        const p1 = new Promise<boolean>((resolve) => {
            setTimeout(()=>{
                resolve(false)
            }, 5000);
        })

        const cp1 = CancellablePromise.wrap(p1);
        setCancelablePromise(cp1.action);
        cp1.promise.then(value=>{
            console.log("Promise completed normally");
            setCancelablePromise(CancellablePromise.initValues)
        }).catch((err)=>{
            console.log(err);
            setCancelablePromise(CancellablePromise.initValues)
        })
    }

    const canClose = () => {
        cancelablePromise.Abort();
        return true;
    }

    useImperativeHandle(ref, () => ({ canClose }), [ canClose ])

    return (
        <Box component="form"
             noValidate
             autoComplete="off"
        >
            <Typography variant="h6" align="center" margin="dense">
                Test Cancelable promise
            </Typography>

            {cancelablePromise.busy && <Button variant="contained" onClick={cancelablePromise.Abort} size="small">Abort</Button>}
            {!cancelablePromise.busy && <Button variant="contained" onClick={runTest} size="small">Run</Button>}


        </Box>
    )
});

export {
    CancelablePromiseForm
}