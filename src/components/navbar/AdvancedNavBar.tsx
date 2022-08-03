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
import Divider from '@mui/material/Divider';


const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

const AdvancedNavBar: React.FC = () => {
    const dispatch = useDispatch();
    const CommandCreateFormByName = (commandName: string, options?: any) => () => {
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

    const SendBasicCommand = (action: ApplicationCommands, parameters?: any) => () => {
        const command = CreateCommand({
            action,
            parameters
        });
        dispatch(SetAppCommand(command));
        handleCloseUserMenu();
    }

    const ConnectMenu: MenuItemsArray = [
        {title: "WMS", action: CommandCreateFormByName("ConnectWMS")},
        {title: "WFS", action: CommandCreateFormByName("ConnectWFS")},
        {title: "WMTS", action: CommandCreateFormByName("ConnectWMTS")},
        {title: "LTS", action: CommandCreateFormByName("ConnectLTS")},
        {separator: true},
        {title: "TMS", action: CommandCreateFormByName("ConnectTMS")},
        {title: "Bingmaps", action: CommandCreateFormByName("ConnectBingmaps")},
        {separator: true},
        {title: "BIM", action: CommandCreateFormByName("Connect3DTilesForm",
                {
                    url: "http://localhost:8081/ogc/3dtiles/merged/tileset.json",
                    label: "BIM/IFC",
                    offsetTerrain: true
                })},
        {title: "Point clouds", action: CommandCreateFormByName("Connect3DTilesForm",
                {
                    url: "http://localhost:8081/ogc/3dtiles/uw_pw_gesamt_point_cloud-2/tileset.json\n",
                    label: "Point Cloud",
                    offsetTerrain: true
                })},
        {separator: true},
        {title: "Vertical Orthophoto", action: CommandCreateFormByName("ConnectVOrthophoto")},
        {title: "Drone photo", action: CommandCreateFormByName("DronePhoto")},
        {separator: true},
        {title: "Panorama", action: CommandCreateFormByName("ConnectPanorama")},
        {title: "Panorama Port AI", action: CommandCreateFormByName("ConnectPanoramaProtAI")},

    //    {title: "Cancellable", action: CommandCreateFormByName("CancellablePromise")},
        {separator: true},
        {title: "LayerGroup", action: CommandCreateFormByName("ConnectLayerGroup")},
    ];

    const ViewMenu: MenuItemsArray = [
        {title: "Full screen", action: SendBasicCommand(ApplicationCommands.TOGGLE_FULL_SCREEN)},
        {title: "Layers", action: CommandCreateFormByName("LayerControlForm")},
    ];

    const menuItems: MenuEntry[] = [
        {title: "Connect", items: ConnectMenu, hint:"Connect to external services"},
        {title: "View", items: ViewMenu, hint:"Expand view menu"},
        {title: "Tools", action: CommandCreateFormByName("ShowTools"), hint:"Expand tools menu"}
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