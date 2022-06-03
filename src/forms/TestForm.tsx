import React, {ForwardedRef, forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {FormControl, FormControlLabel, FormGroup, InputLabel, Select, SelectChangeEvent, Switch} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import {FormProps} from "./interfaces";

const TestForm = forwardRef((props: FormProps, ref:ForwardedRef<any>) =>{
    const {closeForm} = props;
    const [age, setAge] = React.useState('');
    const [ready, setReady] = useState(true);

    const flagAsReady = (event: any) => {
        setReady(event.target.checked);
    }

    const handleChange = (event: SelectChangeEvent) => {
        setAge(event.target.value as string);
    };

    const canClose = () => {
        return ready;
    }

    useImperativeHandle(ref, () => ({ canClose }), [ canClose ])

    useEffect(()=>{
        // Init
        console.log("Init");
        return ()=>{
            // Init
            console.log("Destroy");
        }
    }, [])



    return (
        <form>
            <FormControl size="small" fullWidth>
                <InputLabel id="demo-simple-select-label">Age 1</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={age}
                    label="Age"
                    onChange={handleChange}
                >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                </Select>
            </FormControl>
                <FormGroup>
                    <FormControlLabel control={<Switch checked={ready} onChange={flagAsReady}/>} label="Can close" />
                </FormGroup>
                <div style={{float:"right"}}>
                    <Button variant="contained" onClick={closeForm}>Submit</Button>
                    <Button variant="contained" onClick={closeForm}>Cancel</Button>
                </div>
        </form>

    )
});

export {
    TestForm
}