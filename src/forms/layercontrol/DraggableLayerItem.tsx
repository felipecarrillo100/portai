import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import {ListItem, ListItemAvatar, ListItemText, Menu, Switch} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TreeNodeInterface from "../../interfaces/TreeNodeInterface";
import {Map} from "@luciad/ria/view/Map";
import {AdvanceLayerTools} from "../../components/luciad/layerutils/AdvanceLayerTools";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";


export interface DraggableLayer {
    id: string;
    primary: string;
    secondary: string;
};


const styles = {
    draggingListItem: {
        background: 'rgb(235,235,235)'
    }
};

export type DraggableListItemProps = {
    map: Map | null;
    item: TreeNodeInterface;
    index: number;
};

const DraggableLayerItem = ({ item, index , map}: DraggableListItemProps) => {

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
        console.log("Context Menu 2");
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

    const  handleZoom = (item: TreeNodeInterface) => () => {
        if (map) {
            const targetNode = AdvanceLayerTools.getLayerTreeNodeByID(map, item.id);
            if (targetNode) {
                AdvanceLayerTools.fitToLayer(map, targetNode);
            }
        }
    }

    const deleteLayer = () => {
        if (map && contextMenu) {
            const item = contextMenu.item;
            const targetNode = AdvanceLayerTools.getLayerTreeNodeByID(map, item.id);
            if (targetNode) {
                map.layerTree.removeChild(targetNode);
            }
            handleClose();
        }
    }

    return (
        <>
            <Draggable draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                    <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={styles.draggingListItem}
                        onContextMenu={handleContextMenu(item)}
                    >
                        <ListItemAvatar>
                            <Avatar>
                                <IconButton onClick={handleZoom(item)}>
                                    <WallpaperIcon />
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
                )}
            </Draggable>
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
                <MenuItem onClick={deleteLayer}>Delete</MenuItem>
            </Menu>
        </>

    );
};

export  {
    DraggableLayerItem
};
