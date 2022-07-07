import React from 'react';
import {MenuEntry, MenuItemsArray, NavBarItem, NavBarSubMenu} from "./interfaces";
import Button from "@mui/material/Button";
import {SubMenuItem} from "../SubMenuItem";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import {Divider} from "@mui/material";

interface Props {
    items: MenuEntry[];
    handleClose: () => void;
}

const CompactMenuItems: React.FC<Props> = (props: Props) => {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);


   /* const onClick = (event: React.MouseEvent<HTMLElement>) => {

        props.handleClose();
    }*/


    const renderMenuItems = (items: MenuItemsArray) => {
        const onClick = (item: NavBarItem) => (event: React.MouseEvent<HTMLElement>)  => {
            if (typeof item.action === "function") {
                item.action();
            }
            props.handleClose();
        }
        return items.map((item, index) => {
            if ((item as any).separator) {
                return <Divider key={"kdf_"+index} />
            } else
            if ((item as any).items) {
                const submenu = item as NavBarSubMenu;
                return (<SubMenuItem key={submenu.title} text={submenu.title} icon={submenu.icon}>
                    {renderMenuItems(submenu.items)}
                </SubMenuItem>)
            } else {
                const actionItem = item as NavBarItem;
                return (
                    <MenuItem key={actionItem.title} onClick={onClick(actionItem)}>
                        <Typography textAlign="center">{actionItem.title}</Typography>
                    </MenuItem>
                )
            }
        })
    }

    const renderItems = (itemsMain: MenuEntry[]) => {
        const onClick = (item: MenuEntry) => (event: React.MouseEvent<HTMLElement>)  => {
            if (typeof item.action === "function") {
                item.action();
            }
            props.handleClose();
        }
        return itemsMain.map((itemMain, index) => {
            if ((itemMain as any).separator) {
                return <Divider key={"kdf_"+index}/>
            } else
            if ((itemMain as any).items) {
                const submenu = itemMain as NavBarSubMenu;
                return (<SubMenuItem key={submenu.title} text={submenu.title} icon={submenu.icon}>
                    {renderMenuItems(submenu.items)}
                </SubMenuItem>)
            } else {
                return (
                    <MenuItem key={itemMain.title} onClick={onClick(itemMain)}>
                        <Typography textAlign="center">{itemMain.title}</Typography>
                    </MenuItem>
                )
            }
        })
    }
    return (
        <>
            {renderItems(props.items)}
        </>
    );
}

export {
    CompactMenuItems
}