import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import {MenuEntry, MenuItemsArray} from "./interfaces";
import {AdvancedMenuButton} from "./AdvancedMenuButton";
import {CompactMenuItems} from "./CompactMenuItems";
import {CreateCommand} from "../../commands/CreateCommand";
import {ApplicationCommands} from "../../commands/ApplicationCommands";
import {useDispatch} from "react-redux";
import {SetAppCommand} from "../../reduxboilerplate/command/actions";


const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

const AdvancedNavBar: React.FC = () => {
    const dispatch = useDispatch();
    const CommandByName = (commandName: string, options?: any) => () => {
        const command = CreateCommand({
            action: ApplicationCommands.CREATE_APP_FORM,
            parameters: {
                formName: commandName,
                data: options
            }
        });
        dispatch(SetAppCommand(command));
        handleCloseUserMenu();
    }

    const ConnectMenu: MenuItemsArray = [
        {title: "WMS", action: CommandByName("ConnectWMS")},
        {title: "WFS", action: CommandByName("ConnectWFS")},
        {title: "WMTS", action: CommandByName("ConnectWMTS")},
        {title: "LTS", action: CommandByName("ConnectLTS")},
        {title: "Bingmaps", action: CommandByName("ConnectBingmaps")},
        {title: "BIM", action: CommandByName("Connect3DTilesForm", {url: "http://localhost:8081/ogc/3dtiles/merged/tileset.json"})},
        {title: "Point clouds", action: CommandByName("Connect3DTilesForm", {url: "http://localhost:8081/ogc/3dtiles/uw_pw_gesamt_point_cloud_new/tileset.json"})},
        {title: "Vertical Orthophoto", action: CommandByName("ConnectVOrthophoto")},
        {title: "Drone photo", action: CommandByName("DronePhoto")},
        {title: "Panorama", action: CommandByName("ConnectPanorama")},
    ];

    const ViewMenu: MenuItemsArray = [
        {title: "Full screen", action: ()=>{}},
        {title: "Layers", action: CommandByName("LayerControlForm")},
        {title: "Tools", action: CommandByName("ShowTools")},
    ];

    const menuItems: MenuEntry[] = [
        {title: "Connect", items: ConnectMenu, hint:"Connect to external services"},
        {title: "View", items: ViewMenu, hint:"Expand view menu"},
        {title: "Tools", action: ()=>{console.log("Tools")}, hint:"Expand tools menu"}
    ]

    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <DirectionsBoatIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        PORT AI
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            {/*menuItems.map((item) => (
                                <AdvancedMenuItem key={item.title} handleClose={handleCloseNavMenu} item={item} />
                            ))*/}
                            <CompactMenuItems items={menuItems} handleClose={handleCloseNavMenu} />
                        </Menu>
                    </Box>
                    <DirectionsBoatIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href=""
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        PORT AI
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {menuItems.map((page) => (
                            <AdvancedMenuButton
                                key={page.title}
                                handleClose={handleCloseNavMenu}
                                item={page}
                            />
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                            </IconButton>
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
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                    <Typography textAlign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export {
    AdvancedNavBar
}