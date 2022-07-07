import React, {useState} from "react";
import {LayerControlItem} from "./LayerControlItem";
import {List} from "@mui/material";
import {Map} from "@luciad/ria/view/Map";
import TreeNodeInterface from "../../interfaces/TreeNodeInterface";
import "./LayerControl.scss";
import {AdvanceLayerTools} from "../luciad/layerutils/AdvanceLayerTools";

interface Props {
    map: Map | null;
    rootNode: TreeNodeInterface | null;
}

const LayerControl: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {
    const [draggedItem, setDraggedItem ] = useState("");
    const onLayerMove = (node: string, referenceNode: string, relation: "top" | "below" | "above" | "bottom" | undefined) => {
        const map = props.map;
        if (map) {
            const layer = AdvanceLayerTools.getLayerTreeNodeByID(map, node);
            const referencelayer = AdvanceLayerTools.getLayerTreeNodeByID(map, referenceNode);
            if (layer && referencelayer) {
                AdvanceLayerTools.moveLayers(map, layer, referencelayer, relation);
            }
        }

    }
    const children = props.rootNode && props.map ? [...props.rootNode.nodes].reverse() : [];
    return (
        <List className="LayerControl list-group">
            {children.map((item, index) => (
                <LayerControlItem item={item} key={item.id} map={props.map} onLayerMove={onLayerMove} draggedItem={draggedItem} setDraggedItem={setDraggedItem}/>
            ))}
        </List>
    )
}

export {
    LayerControl
}
