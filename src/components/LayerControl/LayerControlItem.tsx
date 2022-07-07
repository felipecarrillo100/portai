import React, {useRef} from "react";
import {Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText, Menu, MenuItem, Switch} from "@mui/material";
import TreeNodeInterface from "../../interfaces/TreeNodeInterface";
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';

import {AdvanceLayerTools} from "../luciad/layerutils/AdvanceLayerTools";
import {Map} from "@luciad/ria/view/Map";

import "./LayerControlItem.scss";

interface Props {
    map: Map | null;
    item: TreeNodeInterface;
    setDraggedItem: (v: string) => void;
    draggedItem: string;
    onLayerMove: (node: string, referenceNode: string, relation: "top" | "below" | "above" | "bottom" | undefined) => void;
}

const styles = {
    draggingListItem: {
        background: 'rgb(235,235,235)'
    }
};

const LayerControlItem: React.FC<Props> = ({ item , map, setDraggedItem, draggedItem, onLayerMove}: React.PropsWithChildren<Props>) => {
    const clone = useRef(null as HTMLElement | null);
    // const dragOver = useRef(null as HTMLElement | null);

    const [contextMenu, setContextMenu] = React.useState<{
        mouseX: number;
        mouseY: number;
        item: TreeNodeInterface;
    } | null>(null);

    const handleClose = () => {
        setContextMenu(null);
    };

    const handleContextMenu = (item: TreeNodeInterface) => (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                    item
                }
                : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                  // Other native context menus might behave different.
                  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                null,
        );
    }

    const  handleVisibilityToggle = (item: TreeNodeInterface) => () => {
        if (map) {
            const targetNode = AdvanceLayerTools.getLayerTreeNodeByID(map, item.id);
            if (targetNode) {
                targetNode.visible = !targetNode.visible;
            }
        }
    }

    const iconClickHandler = (item: TreeNodeInterface) => () => {
        if (item.treeNodeType==="LAYER_GROUP") {
            if (map) {
                const realNode = AdvanceLayerTools.getLayerTreeNodeByID(map, item.id);
                const node = realNode as any;
                node.collapsed = !node.collapsed;
                if (typeof node._eventSupport !== "undefined")
                    node._eventSupport.emit("TriggerNodeUpdate", {});
            }
        } else {
            handleZoom(item)();
        }
    }

    const  handleZoom = (item: TreeNodeInterface) => () => {
        if (map) {
            const targetNode = AdvanceLayerTools.getLayerTreeNodeByID(map, item.id);
            if (targetNode) {
                AdvanceLayerTools.fitToLayer(map, targetNode);
            }
        }
    }

    const deleteLayer = (layer: TreeNodeInterface) => () => {
        if (map && contextMenu) {
            // const item = contextMenu.item;
            const item = layer;
            const targetNode = AdvanceLayerTools.getLayerTreeNodeByID(map, item.id);
            if (targetNode) {
                AdvanceLayerTools.deleteNode(targetNode);
            }
            handleClose();
        }
    }
    /* Start Drag Methods!!!*/
    const isTargetEqualDestination = (e: any) => {
        let draggedId = draggedItem;
        const result = draggedId === item.id
        return result;
    }
    const dragstart = (event: any) => {
        const crt = event.target.cloneNode(true);
        let bkColor = event.target.backgroundColor;

        crt.style.backgroundColor = bkColor;
        crt.style.position = "absolute"; crt.style.top = "0px"; crt.style.left = "-100000px";
        crt.style.width = 300 + "px";
        clone.current =  crt;
        document.body.appendChild(crt);

        event.dataTransfer.setData('text', item.id);
        setDraggedItem(item.id);
        event.dataTransfer.setDragImage(crt, 0, 0);
    }
    const dragover = (e:any) => {
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (isTargetEqualDestination(e)) return;

        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }

        const item = e.currentTarget;
        const boundingRect = item.getBoundingClientRect();
        const middleOfDiv = boundingRect.top + (boundingRect.height / 2);
        if (e.clientY < middleOfDiv) {
            item.classList.remove("drag-below");
            item.classList.add("drag-above");
        } else {
            item.classList.remove("drag-above");
            item.classList.add("drag-below");
        }
    }
    const dragend = () => {
        if (clone.current) {
            clone.current.remove();
            clone.current = null;
        }
    }
    const handleDragEnterLeave = (e:any) => {
        if (isTargetEqualDestination(e)) return;
        if (e.type === "dragenter") {
            e.currentTarget.classList.add("drag-enter");
        } else {
            e.currentTarget.classList.remove("drag-enter", "drag-above", "drag-below");
        }
    }
    const drop = (e:any) => {
        e.preventDefault();

        if (e.type !== "drop") {
            return;
        }
        // Stores dragged elements ID in var draggedId

        let draggedId;
        if (e.dataTransfer) {
            draggedId = e.dataTransfer.getData("text");
        } else if (e.originalEvent.dataTransfer) {
            draggedId = e.originalEvent.dataTransfer.getData("text");
        }

        let reference: "top" | "below" | "above" | "bottom" | undefined;
        if (e.currentTarget.classList.contains("drag-above")) {
            reference = "above";
        } else if (e.currentTarget.classList.contains("drag-below")) {
            reference = "below";
        }

        e.currentTarget.classList.remove("drag-enter", "drag-above", "drag-below");

        if (draggedId === item.id) {
            return;
        }

        if (onLayerMove) {
            onLayerMove( draggedId, item.id, reference);
        }
    }
    /* End DragMethods*/

    const iconProvider = () => {
        switch (item.treeNodeType) {
            case "LAYER_GROUP":
                if (item.collapsed)
                    return <FolderIcon />
                else
                    return <FolderOpenIcon />
        }
        return <WallpaperIcon />;
    }

    const children = map && item && item.nodes && item.nodes.length>0 && !item.collapsed ? [...item.nodes].reverse() : [];

    return (
        <div className="LayerControlItem">
            <ListItem className="item-draggable noselect" sx={styles.draggingListItem} onContextMenu={handleContextMenu(item)}
                      draggable="true" onDragStart={dragstart} onDragOver={dragover} onDragEnd={dragend} onDragEnter={handleDragEnterLeave} onDragLeave={handleDragEnterLeave} onDrop={drop}
            >
                <ListItemAvatar>
                    <Avatar>
                        <IconButton onClick={iconClickHandler(item)}>
                            {iconProvider()}
                        </IconButton>
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary={item.label} secondary={"Unknown source"} onDoubleClick={handleZoom(item)}/>
                <IconButton onClick={handleContextMenu(item)}><MoreVertIcon/></IconButton>
                <Switch
                    edge="end"
                    onChange={handleVisibilityToggle(item)}
                    checked={item.visible.value}
                    inputProps={{
                        'aria-labelledby': 'switch-list-label-wifi',
                    }}
                />
            </ListItem>
            {children.length>0 && <List className="list-group">
                {children.map((item, index) => (
                    <LayerControlItem item={item} key={item.id} map={map} onLayerMove={onLayerMove} draggedItem={draggedItem} setDraggedItem={setDraggedItem}/>
                ))}
            </List>}

            <Menu
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={deleteLayer(item)}>Delete</MenuItem>
            </Menu>
        </div>
    )
}

export {
    LayerControlItem
}
