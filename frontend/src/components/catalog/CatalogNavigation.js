import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Container,
  Avatar,
  Tooltip,
  Fade,
  Paper,
  Divider,
} from '@mui/material';
import {
  Movie as MovieIcon,
  Tv as TvIcon,
  ViewModule as GridIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

/**
 * CatalogNavigation Component
 * Modern navigation bar for the movie catalog with enhanced UX/UI
 * Features: responsive design, smooth animations, modern styling
 */
const CatalogNavigation = ({
  activeTab,
  onTabChange,
  stats = { totalMedia: 0, totalMovies: 0, totalSeries: 0 },
  onSearch,
  onToggleFilters,
  filtersOpen = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

  // Tab configuration with enhanced styling
  const tabs = [
    { 
      label: 'Todo', 
      icon: <HomeIcon />, 
      value: 0,
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)'
    },
    { 
      label: 'Películas', 
      icon: <MovieIcon />, 
      value: 1,
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'
    },
    { 
      label: 'Series', 
      icon: <TvIcon />, 
      value: 2,
      color: '#45B7D1',
      gradient: 'linear-gradient(135deg, #45B7D1 0%, #96C93D 100%)'
    },
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const getTabStats = (tabIndex) => {
    switch (tabIndex) {
      case 0: return stats.totalMedia;
      case 1: return stats.totalMovies;
      case 2: return stats.totalSeries;
      default: return 0;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, mb: 3 }}>
      {/* Main Navigation Bar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ minHeight: { xs: 64, md: 80 }, px: { xs: 1, md: 2 } }}>
            {/* Logo and Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Avatar
                sx={{
                  width: { xs: 40, md: 48 },
                  height: { xs: 40, md: 48 },
                  mr: 2,
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                <MovieIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
              </Avatar>
              
              <Box>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    lineHeight: 1.2,
                  }}
                >
                  CineCatalog
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  Tu catálogo de entretenimiento
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && (
                <>
                  <Tooltip title="Buscar contenido">
                    <IconButton
                      color="inherit"
                      onClick={onSearch}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={filtersOpen ? "Ocultar filtros" : "Mostrar filtros"}>
                    <IconButton
                      color="inherit"
                      onClick={onToggleFilters}
                      sx={{
                        backgroundColor: filtersOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <FilterIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Notificaciones">
                    <IconButton
                      color="inherit"
                      onClick={handleNotificationsOpen}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <NotificationsIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              <Tooltip title="Más opciones">
                <IconButton
                  color="inherit"
                  onClick={handleMenuOpen}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <MoreIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Navigation Tabs */}
      <Paper 
        elevation={3}
        sx={{
          mt: 2,
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ px: { xs: 1, md: 2 }, py: 1 }}>
            {/* Stats Row */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap', 
              mb: 2,
              justifyContent: 'center',
            }}>
              <Fade in timeout={500}>
                <Chip 
                  label={`${stats.totalMedia} Total`} 
                  sx={{
                    background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E8E 90%)',
                    color: 'white',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(255,107,107,0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(255,107,107,0.4)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                />
              </Fade>
              <Fade in timeout={700}>
                <Chip 
                  label={`${stats.totalMovies} Películas`} 
                  sx={{
                    background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                    color: 'white',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(78,205,196,0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(78,205,196,0.4)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                />
              </Fade>
              <Fade in timeout={900}>
                <Chip 
                  label={`${stats.totalSeries} Series`} 
                  sx={{
                    background: 'linear-gradient(45deg, #45B7D1 30%, #96C93D 90%)',
                    color: 'white',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(69,183,209,0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(69,183,209,0.4)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                />
              </Fade>
            </Box>

            {/* Enhanced Tabs */}
            <Tabs
              value={activeTab}
              onChange={onTabChange}
              variant={isMobile ? 'fullWidth' : 'standard'}
              centered={!isMobile}
              sx={{
                '& .MuiTabs-indicator': {
                  height: 4,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                },
                '& .MuiTab-root': {
                  minHeight: 72,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderRadius: 2,
                  mx: 0.5,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  '&.Mui-selected': {
                    color: '#667eea',
                    fontWeight: 700,
                  },
                },
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  icon={
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      color: activeTab === index ? tab.color : 'inherit',
                    }}>
                      {tab.icon}
                      {!isMobile && (
                        <Chip
                          label={getTabStats(index)}
                          size="small"
                          sx={{
                            background: activeTab === index ? tab.gradient : 'rgba(0,0,0,0.1)',
                            color: activeTab === index ? 'white' : 'inherit',
                            fontWeight: 600,
                            minWidth: 32,
                            height: 24,
                          }}
                        />
                      )}
                    </Box>
                  }
                  label={tab.label}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>
        </Container>
      </Paper>

      {/* Menu Options */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <AccountIcon sx={{ mr: 2 }} />
          Mi Perfil
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <LightModeIcon sx={{ mr: 2 }} />
          Cambiar Tema
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          Configuración
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 300,
            maxWidth: 400,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Notificaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No hay notificaciones nuevas
          </Typography>
        </Box>
      </Menu>
    </Box>
  );
};

export default CatalogNavigation;