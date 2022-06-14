import {Map} from "@luciad/ria/view/Map";
import RectangleSelectController from "../../../components/luciad/controllers/RectangleSelectController";
import RulerController, {
    Ruler2DUpdateValues,
    RulerMode
} from "../../../components/luciad/controllers/measurement/ruler2d/RulerController";
import React, {useEffect, useRef, useState} from "react";
import {Handle} from "@luciad/ria/util/Evented";
import {DefaultMapController} from "../../luciad/controllers/DefaultMapController";
import Button from "@mui/material/Button";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import StraightenIcon from '@mui/icons-material/Straighten';
import DesignServicesIcon from '@mui/icons-material/DesignServices';

import {Divider, FormControl, Grid, InputLabel, OutlinedInput, Select, TextField} from "@mui/material";
import Ruler3DController, {
    Ruler3DControllerTypes,
    Ruler3DUpdateValues
} from "../../luciad/controllers/measurement/Ruler3DController/Ruler3DController";
import MenuItem from "@mui/material/MenuItem";
import FormatUtil from "../../luciad/controllers/measurement/utils/FormatUtil";
import {ENUM_DISTANCE_UNIT} from "../../luciad/units/DistanceUnits";
import Box from "@mui/material/Box";
import {PanoramaActions} from "../../luciad/controllers/actions/PanoramaActions";
import {CompositeController} from "../../luciad/controllers/CompositeController";

interface Props {
    map: Map | null;
}

const Rule2DModes = [
    {value: RulerMode.DISTANCE, title: "Distance"},
    {value: RulerMode.AREA, title: "Area"},
]

const Rule3DModes = [
    {value: Ruler3DControllerTypes.MEASURE_TYPE_DISTANCE, title: "Distance"},
    {value: Ruler3DControllerTypes.MEASURE_TYPE_AREA, title: "Area"},
    {value: Ruler3DControllerTypes.MEASURE_TYPE_HEIGHT, title: "Height"},
    {value: Ruler3DControllerTypes.MEASURE_TYPE_ORTHO, title: "Orthogonal"},
]

const ControllerToolSelector: React.FC<Props> = (props: Props) => {
    const [ruler2DValues, setRuler2DValues]  = useState<Ruler2DUpdateValues>({
        distance:0,
        area:0, areaText:"",
        distanceText:"",
        perimeter:0,
        perimeterText:""
    });
    const [ruler3DValues, setRuler3DValues]  = useState<Ruler3DUpdateValues>({
        area: 0,
        distance: 0,
        areaText: "",
        distanceText: ""
    });

    const [mode2d, setMode2d]  = useState<RulerMode>(RulerMode.DISTANCE);
    const [mode3d, setMode3d]  = useState<Ruler3DControllerTypes>(Ruler3DControllerTypes.MEASURE_TYPE_DISTANCE);

    const [controllerName, setControllerName] = useState("");
    const handle = useRef(null as Handle | null);


    useEffect(() => {
        if (props.map) {
            if (handle.current) {
                handle.current?.remove();
                handle.current = null;
            }
            handle.current = props.map.on('ControllerChanged', controllerHasChanged);
        }
        return () => {
            if (handle.current) {
                handle.current?.remove();
                handle.current = null;
            }
        }
    }, [props.map]);

    const set2DRuler = () => {
        const update2DRulerValues = (newValues: Ruler2DUpdateValues) => {
            newValues.areaText = newValues.areaText.replace("<sup>2</sup>", "²");
            setRuler2DValues(newValues);
        }
        if (props.map) {
            const rulerController = new RulerController({mode:RulerMode.DISTANCE, onUpdate: update2DRulerValues});
            props.map.controller = rulerController;

            rulerController.formatUtil = new FormatUtil({units: ENUM_DISTANCE_UNIT.METRE});


        }
    }

    const set3DRuler = () => {
        if (props.map) {
            const rulerController = new Ruler3DController();
            props.map.controller = rulerController;

            rulerController.onMeasurementChange(() => {
                const totals = rulerController.getMeasurements().totals;
                const distance = rulerController.formatUtil.distanceText(totals.length);
                const area = rulerController.formatUtil.areaText(totals.area);
                setRuler3DValues({
                        area: 0,
                        distance: 0,
                        areaText: area,
                        distanceText: distance
                    });
            });
            rulerController.onMeasurementDeactivated( () => {
                setRuler3DValues({
                    area: 0,
                    distance: 0,
                    areaText: "",
                    distanceText: ""
                });
            });
        }
    }

    const setDefaultRuler = () => {
        if (props.map) {
            props.map.controller = DefaultMapController.getDefaultMapController();
        }
    }

    const selectionController = () => {
        if (props.map) {
            props.map.controller = new RectangleSelectController();
        }
    }

    const controllerHasChanged = () => {
        let controllerName = "";
        if (props.map && props.map.controller) {
            controllerName = props.map.controller.constructor.name;
        }
        setControllerName(controllerName);
        if (controllerName!==CompositeController.name) {
            closePanorama();
        }
    }

    const handleSelect2D = (event: any) => {
        const {name, value} = event.target;
        setMode2d(value);
        if (props.map && props.map.controller instanceof RulerController) {
            const controller = props.map.controller as RulerController;
            controller.setMode(value);
        }
    }

    const handleSelect3D = (event: any) => {
        const {name, value} = event.target;
        setMode3d(value);
        if (props.map && props.map.controller instanceof Ruler3DController) {
            const controller = props.map.controller as Ruler3DController;
            controller.setMode(value);
        }
    }

    const render2DModes = Rule2DModes.map( m=> (<MenuItem value={m.value} key={m.value}>{m.title}</MenuItem> ))
    const render3DModes = Rule3DModes.map( m=> (<MenuItem value={m.value} key={m.value}>{m.title}</MenuItem> ))


    const closePanorama = () => {
        if (props.map && (props.map as any)._myPanoramaActions) {
            const panoActions = (props.map as any)._myPanoramaActions as PanoramaActions;
            panoActions.leavePanoramaMode()
        }
    }

    return (
        <>
            <Divider sx={{marginTop: 0}}>Measure</Divider>
            <Button onClick={setDefaultRuler} variant={controllerName === "" ? "contained" : "outlined"}
                    title="Default"><PanToolAltIcon/></Button>
            <Button onClick={set2DRuler} variant={controllerName === RulerController.name ? "contained" : "outlined"}
                    title="Ruler 2D"><StraightenIcon/></Button>
            <Button onClick={set3DRuler} variant={controllerName === Ruler3DController.name ? "contained" : "outlined"}
                    title="Ruler 3D"><DesignServicesIcon/></Button>
            {/*   <Button onClick={selectionController}
                    variant={controllerName === RectangleSelectController.name ? "contained" : "outlined"}
                    title="Select"><HighlightAltIcon/></Button> */}

            {controllerName === RulerController.name &&
            <>
                <Divider sx={{marginTop: 1}}>2D Ruler</Divider>
                <Box component="form" noValidate autoComplete="off">
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12}>
                            <FormControl fullWidth size="small" required>
                            <InputLabel id="mode-2d-ruler-id" >Mode</InputLabel>
                            <Select
                                labelId="mode-2d-ruler-id"
                                value={mode2d}
                                label="Mode"
                                name="mode2d"
                                onChange={handleSelect2D}
                                input={<OutlinedInput label="Layers" />}
                            >
                                {render2DModes}
                            </Select>
                            </FormControl>
                        </Grid>
                            {(mode2d===RulerMode.DISTANCE) && <React.Fragment>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    value={ruler2DValues.distanceText}
                                    name="Distance"
                                    fullWidth
                                    size="small"
                                    id="outlined-required"
                                    label="Distance:"
                                    aria-readonly
                                    inputProps={
                                        { readOnly: true, }
                                    }
                                />
                            </Grid>
                        </React.Fragment>}
                        {(mode2d===RulerMode.AREA) && <React.Fragment>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    value={ruler2DValues.perimeterText}
                                    name="Perimeter"
                                    fullWidth
                                    size="small"
                                    id="outlined-required"
                                    label="Perimeter:"
                                    aria-readonly
                                    inputProps={
                                        { readOnly: true, }
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    value={ruler2DValues.areaText}
                                    name="Area"
                                    fullWidth
                                    size="small"
                                    id="outlined-required"
                                    label="Area:"
                                    aria-readonly
                                    inputProps={
                                        { readOnly: true, }
                                    }
                                />
                            </Grid>
                        </React.Fragment> }
                        </Grid>
                </Box>
            </>
            }
            {controllerName === Ruler3DController.name &&
            <>
                <Divider sx={{marginTop: 1}}>3D Ruler</Divider>
                <Box component="form" noValidate autoComplete="off">
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12}>
                            <FormControl fullWidth size="small" required>
                                <InputLabel id="mode-2d-ruler-id" >Mode</InputLabel>
                                <Select
                                    labelId="mode-2d-ruler-id"
                                    value={mode3d}
                                    label="Mode"
                                    name="mode2d"
                                    onChange={handleSelect3D}
                                    input={<OutlinedInput label="Layers" />}
                                >
                                    {render3DModes}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                value={ruler3DValues.distanceText}
                                name="Distance"
                                fullWidth
                                size="small"
                                id="outlined-required"
                                label="Distance:"
                                aria-readonly
                                inputProps={
                                    { readOnly: true, }
                                }
                            />
                        </Grid>
                        {(mode3d===Ruler3DControllerTypes.MEASURE_TYPE_AREA) &&
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    value={ruler3DValues.areaText}
                                    name="Area"
                                    fullWidth
                                    size="small"
                                    id="outlined-required"
                                    label="Area:"
                                    aria-readonly
                                    inputProps={
                                        { readOnly: true, }
                                    }
                                />
                            </Grid>
                        }
                    </Grid>
                </Box>
            </>
            }
        </>
    )

}

export {
    ControllerToolSelector
}