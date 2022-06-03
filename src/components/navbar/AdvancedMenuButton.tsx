import React from 'react';
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import {MenuEntry, MenuItemsArray, NavBarItem, NavBarSubMenu} from "./interfaces";
import Button from "@mui/material/Button";
import {Menu, Tooltip} from "@mui/material";
import Box from "@mui/material/Box";
import {SubMenuItem} from "../SubMenuItem";

interface Props {
    item: MenuEntry;
    handleClose: () => void;
}

const AdvancedMenuButton: React.FC<Props> = (props: Props) => {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };


    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };


    const onClick = (event: React.MouseEvent<HTMLElement>) => {
        // props.handleClose();
        if (props.item.action) {
            props.item.action();
        } else {
            handleOpenUserMenu(event);
        }
    }
    const localItems = props.item.items ? props.item.items : [];

    const renderMenuItems = (items: MenuItemsArray) => {
        const onClick = (item: NavBarItem) => (event: React.MouseEvent<HTMLElement>)  => {
            if (typeof item.action === "function") {
                item.action();
            }
            props.handleClose();
            handleCloseUserMenu();
        }
        return items.map((item) => {
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

    return (
        <Box sx={{ flexGrow: 0 }}>
            <Tooltip title={props.item.hint ? props.item.hint : ""}>
                <Button
                    onClick={onClick}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                >
                    {props.item.title}
                </Button>
            </Tooltip>
            <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                >
                    {renderMenuItems(localItems)}
            </Menu>
        </Box>
    );
}

export {
    AdvancedMenuButton
}