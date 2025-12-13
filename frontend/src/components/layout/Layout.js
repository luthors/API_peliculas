import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Movie as MovieIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  VideoLibrary as VideoLibraryIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  AccountCircle,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const drawerWidth = 240;

/**
 * Main Layout Component
 * Provides the overall structure with navigation sidebar and main content area
 */
const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Navigation menu items
  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/admin/dashboard",
    },
    {
      text: "Medios",
      icon: <MovieIcon />,
      path: "/admin/media",
    },
    {
      text: "Géneros",
      icon: <CategoryIcon />,
      path: "/admin/genres",
    },
    {
      text: "Directores",
      icon: <PersonIcon />,
      path: "/admin/directors",
    },
    {
      text: "Productoras",
      icon: <BusinessIcon />,
      path: "/admin/producers",
    },
    {
      text: "Tipos",
      icon: <VideoLibraryIcon />,
      path: "/admin/types",
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate("/login");
  };

  // Drawer content
  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Películas & Series
        </Typography>
      </Toolbar>
      <Divider />

      {/* User info */}
      {user && (
        <>
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                margin: "0 auto 8px",
                bgcolor: theme.palette.primary.main,
              }}
            >
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </Avatar>
            <Typography variant="subtitle2" noWrap>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              {user.email}
            </Typography>
            <Chip label={user.role} size="small" color="primary" sx={{ mt: 1 }} />
          </Box>
          <Divider />
        </>
      )}

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: theme.palette.primary.light,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.light,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? theme.palette.primary.main : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: location.pathname === item.path ? theme.palette.primary.main : "inherit",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sistema de Gestión de Películas y Series
          </Typography>

          {/* User menu */}
          {user && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="user-menu"
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              </Box>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Cerrar Sesión</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="mailbox folders">
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </Box>
  );
};

export default Layout;
