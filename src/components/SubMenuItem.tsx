import React, {useState} from 'react';
import MenuItem from "@mui/material/MenuItem";
import {Collapse, ListItemIcon, ListItemText} from "@mui/material";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import List from "@mui/material/List";

interface Props {
    text: string;
    icon?: React.ReactNode;
}

const SubMenuItem = ( props: React.PropsWithChildren<Props>) => {
    const [open, setOpen] = useState(false);

    const toggleSubmenu = () => {
        setOpen(!open);
    }
    return (<>
        <MenuItem onClick={toggleSubmenu}>
            {props.icon &&
                <ListItemIcon>
                    {props.icon}
                </ListItemIcon>
            }
            <ListItemText  primary={props.text} />
            {open ? <ExpandLess /> : <ExpandMore />}
        </MenuItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
            <div style={{paddingLeft: 12}}>
                <List component="div" disablePadding>
                    {props.children}
                </List>
            </div>
        </Collapse>
    </>)
}

export {
    SubMenuItem
}