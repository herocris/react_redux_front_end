import { canAccess, accessDestinations } from '../../modules/auth/access';
import { IconButton, styled, AppBar, Box, CssBaseline, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { ReactNode, useState } from 'react';
import { AccountCircle, Logout, Person, RecentActors, Map, ContactEmergency, SignalCellularAlt, Inventory2, FormatListBulleted, HomeRepairServiceOutlined, Vaccines, AllInbox, Category } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { selectSessionUser } from '../../modules/auth/selectors';
import { startLogout } from '../../modules/auth/thunks';
import { refreshAuthorization } from '../../modules/auth/thunks/refreshAuthorization';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate, useLocation } from 'react-router';
import { useThemeContext } from '../../theme/themeState';
import { Brightness4, Brightness7 } from "@mui/icons-material";

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

interface GrapLayoutProps {
    children: ReactNode;
    title?: string;
    window?: () => Window;
}

export const GrapLayout = ({ children, title = '', window }: GrapLayoutProps) => {
    const { pathname } = useLocation();
    const user = useAppSelector(selectSessionUser);
    const dispatch = useAppDispatch();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const refreshPermissions = async () => {
        setRefreshing(true);
        try { await dispatch(refreshAuthorization()); }
        finally { setRefreshing(false); }
    };
    const { mode, toggleMode } = useThemeContext();//para modo oscuro

    const onLogout = () => {
        void dispatch(startLogout()).catch(() => {
            // A failed or superseded logout retains the current session.
        });
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

    const navigate = useNavigate();
    const authMenuOptions = [
        { name: 'Usuarios', url: '/user', icon: <Person /> },
        { name: 'Roles', url: '/rol', icon: <RecentActors /> },
        { name: 'Permisos', url: '/permiso', icon: <ContactEmergency /> },
        { name: 'Actividad', url: '/actividad', icon: <FormatListBulleted /> }
    ]
    const menuOptions = [
        { name: 'Municiones', url: '/ammunition', icon: <HomeRepairServiceOutlined /> },
        { name: 'Drogas', url: '/drug', icon: <Vaccines /> },
        { name: 'Armas', url: '/weapon', icon: <AllInbox /> },
        { name: 'Presentaciones de droga', url: '/drugPresentation', icon: <Category /> },
        { name: 'Decomisos', url: '/confiscation', icon: <Inventory2 /> },

    ]
    const displayMenuOptions = [
        { name: 'Panel de inicio', url: '/dashboard', icon: <AccountCircle /> },
        { name: 'Gráficos', url: '/graph', icon: <SignalCellularAlt /> },
        { name: 'Mapa', url: '/map', icon: <Map /> },
    ]

    const visible = (item: { url: string }) => {
        const destination = accessDestinations.find(entry => entry.path === item.url);
        return !!destination && canAccess(user, destination.domain);
    };
    const drawer = (
        <div>
            <Toolbar sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                <AccountCircle sx={{ marginRight: '10px' }} fontSize="large" />{user.nombre}
            </Toolbar>
            <Divider />
            <List>
                {displayMenuOptions.filter(visible).map((opt, index) => (
                    <ListItem key={index} disablePadding >
                        <ListItemButton onClick={() => { navigate(opt.url); setMobileOpen(false); }} selected={pathname == opt.url}>
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
                {authMenuOptions.filter(visible).map((opt, index) => (
                    <ListItem key={index} disablePadding >
                        <ListItemButton onClick={() => { navigate(opt.url); setMobileOpen(false); }} selected={pathname == opt.url}>
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
                {menuOptions.filter(visible).map((opt, index) => (
                    <ListItem key={index} disablePadding >
                        <ListItemButton onClick={() => { navigate(opt.url); setMobileOpen(false); }} selected={pathname == opt.url}>
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
                        aria-label="Abrir menú"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" component="span" sx={{ flexGrow: 1, minWidth: 0 }}>Decomisos</Typography>
                    <IconButton
                        sx={{ ml: 1 }}
                        aria-label={mode === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'}
                        onClick={toggleMode}
                        color="inherit"
                    >
                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                    <IconButton color="inherit" aria-label="Actualizar permisos" disabled={refreshing}
                        onClick={() => void refreshPermissions()}><RefreshIcon /></IconButton>
                    <IconButton
                        color="inherit"
                        aria-label="Cerrar sesión"
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
                aria-label="Navegación principal"
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
                sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3 }, width: '100%' }}
            >
                <DrawerHeader />
                {children}
                {title}
            </Box>
        </Box>
    );
}
