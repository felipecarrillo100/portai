import React, {useCallback, useEffect, useRef} from "react";
import {Map} from "@luciad/ria/view/Map";
import {WebGLMap} from "@luciad/ria/view/WebGLMap";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";

import "./CartesianMap.scss";
import {useSelector} from "react-redux";
import {IAppState} from "../../../reduxboilerplate/store";
import {CoordinateReference} from "@luciad/ria/reference/CoordinateReference";
import {RasterTileSetLayer} from "@luciad/ria/view/tileset/RasterTileSetLayer";
import {createBounds, createPoint} from "@luciad/ria/shape/ShapeFactory";
import {UrlTileSetModelCartesian} from "../models/UrlTileSetModelCartesian";
import {Point} from "@luciad/ria/shape/Point";
import {MouseCoordinateReadout} from "../mousecoordinates/MouseCoordinateReadout";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {CartesianAnnotationsPainter} from "./CartesianAnnotationsPainter";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {FeaturesRestAPIStore} from "../stores/FeaturesRestAPIStore";
import {ContextMenu} from "@luciad/ria/view/ContextMenu";
import {ContextmenuRecords} from "../../contextmenu/ContextmenuRecords";
import {EditSelectLayerTools} from "../layertreetools/EditSelectLayerTools";
import {Shape} from "@luciad/ria/shape/Shape";
import {ElementResizeListener} from "../../resizelistener/ElementResizeListener";
import {LayerTreeVisitor} from "@luciad/ria/view/LayerTreeVisitor";
import {LayerTreeNode} from "@luciad/ria/view/LayerTreeNode";

interface Props {
    layer: FeatureLayer;
    onVisibilityChange?: (v: boolean) => void;
    className?: string;
    id?: string;
    feature: Feature;
    type: string;
    setMap: (map:Map) => void;
    initialPosition?: number[]
}

interface StateProps {
    mainMap: Map | null;
}

export const CARTESIAN_RASTER_LAYER_ID = "raster-layer-id";
export const CARTESIAN_LAYER_FEATURES_ID = "features-layer-id";
const crs1Reference = getReference("CRS:1");

export const getFilenameFromModel = (model: FeatureModel, feature: Feature) => {
    let fileOrFileName = "";
    const store = model.store as any;
    const url = store.url;
    const baseUrl = url.substring(0, url.lastIndexOf("/"));
    const image = feature.properties.image;
    fileOrFileName = `${baseUrl}${image}`;
    return fileOrFileName;
}

function findFeatureModel(map: Map, url:string) {
    let targetModel = null;
    const layerTreeVisitor = {
        visitLayer: (layer: any) => {
            if (layer.model && layer.model.store instanceof FeaturesRestAPIStore && layer.model.store.url===url) {
                targetModel = layer.model;
            }
            return LayerTreeVisitor.ReturnValue.CONTINUE;
        },
        visitLayerGroup: (layerGroup: any) => {
            layerGroup.visitChildren(layerTreeVisitor, LayerTreeNode.VisitOrder.TOP_DOWN);
            return LayerTreeVisitor.ReturnValue.CONTINUE;
        }
    };
    map?.layerTree.visitChildren(layerTreeVisitor, LayerTreeNode.VisitOrder.TOP_DOWN);
    return targetModel;
}

const PortCartesianMap: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {
    const divEl = useRef(null);
    const correctionFactor = useRef(1);
    const map = useRef(null as Map | null);
    const className = "CartesianMap"+ (typeof props.className !== "undefined" ? " " + props.className : "");

    const { mainMap } = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            mainMap: state.luciadMap.map,
        }
    });

    const initializeMap = (map: Map) => {
        if (typeof props.setMap === "function") props.setMap(map);
        map.onShowContextMenu = onShowContextMenu;

        createRasterLayer(map);
        createRestAPIFeatureLayer(map);
    }

    const createRestAPIFeatureLayer = (map: Map) => {

        const getFeatureModel = () => {
            const filename = getFilename();
            const url = "./annotations/" + filename.replace(/\//g, "_").replace(/\./g, "_");
            let modelExists = null;
            if (mainMap) {
                modelExists = findFeatureModel(mainMap, url);
            }
            if (modelExists) return modelExists;
            const featureStore = new FeaturesRestAPIStore({url, reference: crs1Reference});
            return new FeatureModel(featureStore, {
                reference: crs1Reference
            })
        }
        const createAnnotationsLayer = () =>{

            const featureModel = getFeatureModel();
            return new FeatureLayer(featureModel, {
                selectable: true,
                editable: true,
                visible: true,
                id: CARTESIAN_LAYER_FEATURES_ID,
                label: "Annotations"
            });
        }
        const layer = createAnnotationsLayer();
        layer.on("VisibilityChanged", (v: boolean) => {
            if (typeof props.onVisibilityChange === "function"){
                props.onVisibilityChange(v);
            }
        });
        layer.painter = new CartesianAnnotationsPainter();
        const CreateContextMenu = (layer: FeatureLayer) => (contextMenu: ContextMenu, map: Map, contextMenuInfo: any) => {
            const feature = contextMenuInfo.objects[0];
            contextMenu.addItem({label:"Edit shape", action: ()=>{
                console.log("Edit shape");
                EditSelectLayerTools.editFeature(layer, map,contextMenuInfo, undefined );
            }});
            contextMenu.addItem({label:"Delete", action: ()=>{
                    console.log("Edit shape");
                    EditSelectLayerTools.deleteFeature(layer, map, contextMenuInfo );
                }});
        };

        const balloonProvider = (layer: FeatureLayer, map:Map) => (o: Feature | Shape): string | HTMLElement => {
            const myProps = (o as Feature).properties;
            let inputForm = document.createElement("form", {});
            inputForm.id = "my-props-editor-form";
            inputForm.className="my-props-editor"
            for (const key in myProps) {
                if (myProps.hasOwnProperty(key) && key !== "uid") {
                    const group = document.createElement("div");
                    group.className="my-input-group"
                    const label = document.createElement("label");
                    label.innerText = key + ":";
                    const input = document.createElement("input");
                    input.value = myProps[key];
                    input.name = key;
                    group.appendChild(label);
                    group.appendChild(input);
                    inputForm.appendChild(group);
                }
            }
            const button = document.createElement("button");
            button.innerText="Save"
            button.onclick = ()=>{
                const inputs  = inputForm.getElementsByTagName("input");
                if (inputs) {
                    const newProperties = {} as any;
                    for (let i=0; i<inputs.length; ++i) {
                        const input = inputs[i];
                        newProperties[input.name] = input.value;
                    }
                    console.log(newProperties);
                    const store = layer.model.store as FeaturesRestAPIStore;
                    const feature = o as Feature;
                    feature.properties = newProperties;
                    store.put(feature);
                }
                map.hideBalloon();
            }
            inputForm.appendChild(button);
            return inputForm;
        };
        layer.balloonContentProvider = balloonProvider(layer, map);

        layer.onCreateContextMenu = CreateContextMenu(layer);
        map.layerTree.addChild(layer, "top");
    }

    const onShowContextMenu = (position: number[], contextMenu: ContextMenu) => {
        const menu = ContextmenuRecords.getMapContextmenu();
        if (menu) {
            const o = {
                clientX: position[0],
                clientY: position[1],
                menuItems: contextMenu.items.map(item=>({title:item.label, action: item.action}))
            }
            menu.openMenu(o);
        }
    }

    const getFilename = () => {
        let fileOrFileName = "";
        const store = props.layer.model.store as any;
        const url = store.url;
        const baseUrl = url.substring(0, url.lastIndexOf("/"));
        const image = props.feature.properties.image;
        fileOrFileName = `${baseUrl}${image}`;
        return fileOrFileName;
    }
    const createRasterLayer = (map: Map) => {
        const fileOrFileName = getFilename();

        createLayer("Photo", fileOrFileName, crs1Reference).then(layer => {
            setCRS1ImageLayer(map, layer);
        }).catch(error => console.log(`Cannot add layer: ${error.message}`, error))
    }

    useEffect(()=>{
        if (divEl.current !== null && map.current===null) {
            map.current = new WebGLMap(divEl.current, { reference: crs1Reference });
            initializeMap(map.current);
        }
    }, [divEl.current]);


    const createLayer = (layerName: string, fileOrURL: string, reference: CoordinateReference): Promise<RasterTileSetLayer> => {
        return new Promise((resolve, reject) => {
            fetch(fileOrURL+"?service=GetInfo")
                .then(response => {
                    return response.json();
                })
                .then(imageInfo => {
                    correctionFactor.current = imageInfo.totalWidth / imageInfo.width
                    const urlTileSetModel = new UrlTileSetModelCartesian({
                        reference,
                        bounds: createBounds(reference, [0, imageInfo.totalWidth, 0, imageInfo.totalHeight]),
                        baseURL: fileOrURL,
                        levelCount: 1,
                        level0Columns: imageInfo.columns,
                        level0Rows: imageInfo.rows,
                        // tileWidth: imageInfo.tileWidth / 2,
                        // tileHeight: imageInfo.tileHeight /2,
                        tileWidth: imageInfo.tileWidth ,
                        tileHeight: imageInfo.tileHeight,
                        credentials: false
                    });

                    resolve(new RasterTileSetLayer(urlTileSetModel, {
                        label: layerName,
                        visible: true,
                        id: CARTESIAN_RASTER_LAYER_ID
                    }));
                });
        });
    }

    const setCRS1ImageLayer = (map: Map, layer: RasterTileSetLayer) =>  {
        // Fit on raster layer
        const bounds= layer.model!.bounds!;
        // map.mapNavigator.constraints.limitBounds = bounds;

        map.mapNavigator.constraints = {
            limitBounds: bounds,
            scale: {
                minScale: 2e-2,
                maxScale: 1
            }
        };
       // const targetBounds = createBounds(bounds.reference, [bounds.x, 6000, bounds.y, bounds.height]);
        const targetBounds = createBounds(bounds.reference, [bounds.x, bounds.width, bounds.y, bounds.height]);
        map.mapNavigator.fit({
            bounds: targetBounds,
            animate: false
        });
        // Remove
        const layerImage = map.layerTree.findLayerById(CARTESIAN_RASTER_LAYER_ID);
        if (layerImage) {
            map.layerTree.removeChild(layerImage);
        }
        // Add the layer to the map
        const layerFeatures = map.layerTree.findLayerById(CARTESIAN_LAYER_FEATURES_ID);
        if (layerFeatures) {
            map.layerTree.addChild(layer, "below", layerFeatures);
        } else {
            map.layerTree.addChild(layer, "bottom");
        }
            setTimeout(()=>{
                if (props.initialPosition) {
                    console.log("Initial:", props.initialPosition)

                    if (map.mapNavigator.constraints.limitBounds && map.mapNavigator.constraints.limitBounds.bounds) {
                        const width = map.mapNavigator.constraints.limitBounds.bounds.width;
                        const height = map.mapNavigator.constraints.limitBounds.bounds.height;
                        const targetX = width * props.initialPosition[0] / correctionFactor.current;
                        const targetY = height * props.initialPosition[1];
                        const targetPoint = createPoint(crs1Reference, [targetX, targetY]);
                        map.mapNavigator.pan({targetLocation: targetPoint, animate: false})
                    }
                }
            }, 100)

    }

    const formatter = {
        format: (point: Point): string => {
            return "(x:" + point.x.toFixed(0) + ", y:" + point.y.toFixed(0) + ")"
        }
    }

    const adaptResize =() => {
        console.log("Map size has changed!!");
        if (map.current) {
            map.current.resize();
        }
    };

    return <div id={props.id} className={className} ref={divEl}>
        <ElementResizeListener onResize={adaptResize}/>
        {props.children}
        {<MouseCoordinateReadout map={map.current} reference={crs1Reference} formatter={formatter} />}
    </div>
}

export {
    PortCartesianMap
}