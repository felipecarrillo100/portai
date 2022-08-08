import React, {ForwardedRef, forwardRef, useEffect, useImperativeHandle, useState} from "react";

import {Fade, Menu} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

export interface FeatureContextmenuExports {
    openMenu: (event: {clientX: number; clientY: number; menuItems: ContextMenuItem[]}) => void;
}

interface Props {
    anchorEl: HTMLElement | null;
}

interface ContextMenuItem {
    title: string;
    action: ()=>void;
}

const FeatureContextmenu = forwardRef((props: Props, ref:ForwardedRef<FeatureContextmenuExports>) =>{
    const [items, setItems] = useState([] as ContextMenuItem[])
    const [contextMenu, setContextMenu] = React.useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);

    const [open, setOpen] = useState(false);
    const handleClose = () => {
        setOpen(false);
    };

    const openMenu = (event: {clientX: number; clientY: number; menuItems: ContextMenuItem[]}) => {
        setItems(event.menuItems);
        setContextMenu( {
            mouseX: event.clientX ,
            mouseY: event.clientY ,
            });
        setOpen(true);
    };

    useEffect(()=>{
        if (props.anchorEl) {
            console.log(props.anchorEl);
        }
    }, [props.anchorEl])

    useImperativeHandle(ref, () => ({ openMenu }), []);

    const handleAction = (item: ContextMenuItem) => ()=> {
        if (typeof item.action === "function") item.action();
        handleClose();
    }
    const renderItems = items.map((item, index)=>(<MenuItem key={index} onClick={handleAction(item)}>{item.title}</MenuItem>))
    return (
         <Menu
             onContextMenu={event => {
                 event.preventDefault();
             }}
            id="demo-positioned-menu" aria-labelledby="demo-positioned-button"
            anchorEl={props.anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{
                vertical: contextMenu ? -contextMenu.mouseY : 0 ,
                horizontal: contextMenu ? -contextMenu.mouseX : 0 ,
            }}
            TransitionComponent={Fade}
         >
             {renderItems}
        </Menu>);
});

export {
    FeatureContextmenu
}