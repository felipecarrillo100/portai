import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import {ListItem, ListItemAvatar, ListItemText, makeStyles} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import InboxIcon from '@mui/icons-material/Inbox';


export interface DraggableItem {
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
    item: DraggableItem;
    index: number;
};

const DraggableListItem = ({ item, index }: DraggableListItemProps) => {
    return (
        <Draggable draggableId={item.id} index={index}>
            {(provided, snapshot) => (
                <ListItem
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={styles.draggingListItem}
                >
                    <ListItemAvatar>
                        <Avatar>
                            <InboxIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={item.primary} secondary={item.secondary} />
                </ListItem>
            )}
        </Draggable>
    );
};

export default DraggableListItem;
