import { IconButton, styled, AppBar, Box, CssBaseline, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Link } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { ReactNode, useState } from 'react';
import { AccountCircle, Logout, Person, RecentActors, Map, ContactEmergency, SignalCellularAlt, Inventory2, FormatListBulleted, HomeRepairServiceOutlined, Vaccines, AllInbox, Category } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { RootState } from '../../store';
import { startLogout } from '../../modules/auth/thunks';
import { useNavigate, useLocation } from 'react-router';
import { useThemeContext } from '../../theme/ThemeContext';
import { Brightness4, Brightness7 } from "@mui/icons-material";

const drawerWidth = 240;

interface GrapLayoutProps {
    children: ReactNode;
    title?: string;
    window?: () => Window;
}

export const GrapLayout = ({ children, title = '', window }: GrapLayoutProps) => {
    const { pathname } = useLocation();
    const { user } = useAppSelector((state: RootState) => state.auth);
    const dispatch = useAppDispatch();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const { mode, toggleMode } = useThemeContext();//para modo oscuro

    const onLogout = () => {
        dispatch(startLogout());
    }
    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setMobileOpen(!mobileOpen);
        }
    };

    const DrawerHeader = styled('div')(({ theme }) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    }));

    const navigate = useNavigate();
    const authMenuOptions = [
        { name: 'Users', url: '/user', icon: <Person /> },
        { name: 'Roles', url: '/rol', icon: <RecentActors /> },
        { name: 'Permission', url: '/permiso', icon: <ContactEmergency /> },
        { name: 'Event logs', url: '/actividad', icon: <FormatListBulleted /> }
    ]
    const menuOptions = [
        { name: 'Ammunitions', url: '/ammunition', icon: <HomeRepairServiceOutlined /> },
        { name: 'Drug', url: '/drug', icon: <Vaccines /> },
        { name: 'Weapon', url: '/weapon', icon: <AllInbox /> },
        { name: 'Drug presentations', url: '/drugPresentation', icon: <Category /> },
        { name: 'Confiscations', url: '/confiscation', icon: <Inventory2 /> },

    ]
    const displayMenuOptions = [
        { name: 'Graphs', url: '/graph', icon: <SignalCellularAlt /> },
        { name: 'Map', url: '/map', icon: <Map /> },
    ]

    const drawer = (
        <div>
            <Toolbar onClick={() => navigate('/dashboard')} sx={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}>
                <AccountCircle sx={{ marginRight: '10px' }} fontSize="large" />{user.nombre}
            </Toolbar>
            <Divider />
            <List>
                {displayMenuOptions.map((opt, index) => (
                    <ListItem key={index} disablePadding >
                        <ListItemButton onClick={() => navigate(opt.url)} selected={pathname == opt.url}>
                            <ListItemIcon>
                                {opt.icon}
                            </ListItemIcon>
                            <ListItemText primary={opt.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {authMenuOptions.map((opt, index) => (
                    <ListItem key={index} disablePadding >
                        <ListItemButton onClick={() => navigate(opt.url)} selected={pathname == opt.url}>
                            <ListItemIcon>
                                {opt.icon}
                            </ListItemIcon>
                            <ListItemText primary={opt.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {menuOptions.map((opt, index) => (
                    <ListItem key={index} disablePadding >
                        <ListItemButton onClick={() => navigate(opt.url)} selected={pathname == opt.url}>
                            <ListItemIcon>
                                {opt.icon}
                            </ListItemIcon>
                            <ListItemText primary={opt.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            
        </div>
    );

    // Remove this const when copying and pasting into your project.
    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    
                    <Link
                        href="https://github.com/herocris/react_redux_front_end"
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        variant="h6"
                        color="inherit"
                        sx={{ flexGrow: 1 }}
                    >
                        Repo: https://github.com/herocris/react_redux_front_end
                    </Link>
                    <IconButton
                        sx={{ ml: 1 }}
                        onClick={toggleMode}
                        color="inherit"
                    >
                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="end"
                        onClick={onLogout}
                    >
                        <Logout />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
                aria-label="mailbox folders"
            >
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onTransitionEnd={handleDrawerTransitionEnd}
                    onClose={handleDrawerClose}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    slotProps={{
                        root: {
                            keepMounted: true, // Better open performance on mobile.
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                //sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
                sx={{ flexGrow: 1, p: 3, width: '100%' }}
            >
                <DrawerHeader />
                {children}
                {title}
            </Box>
        </Box>
    );
}
