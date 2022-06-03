import React, { useEffect } from "react";
import {FormControl, InputLabel, Select, SelectChangeEvent, Switch} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import {FormProps} from "./interfaces";

const TestForm2 = (props: FormProps) =>{
    const {closeForm} = props;
    const [age, setAge] = React.useState('');

    const handleChange = (event: SelectChangeEvent) => {
        setAge(event.target.value as string);
    };


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
                <InputLabel id="demo-simple-select-label">Age 2</InputLabel>
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

                <div style={{float:"right"}}>
                    <Button variant="contained" onClick={closeForm}>Submit</Button>
                    <Button variant="contained" onClick={closeForm}>Cancel</Button>
                </div>
        </form>
    )
};

export {
    TestForm2
}