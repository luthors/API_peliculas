import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  InputBase,
  Button,
  Container,
  useScrollTrigger,
  Slide,
  alpha,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Movie as MovieIcon,
  FilterList as FilterIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useThemeMode } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Hide AppBar on scroll down
 */
function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

/**
 * Public Navigation Bar Component
 * Professional navbar with search, theme toggle, and smooth animations
 */
const PublicNavBar = ({ onSearch, onFilterClick, categories = [] }) => {
  const navigate = useNavigate();
  const { mode, toggleTheme, isDarkMode } = useThemeMode();
  const { isAuthenticated, user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleCategoryClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCategoryClose = () => {
    setAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate("/catalog");
  };

  return (
    <HideOnScroll>
      <AppBar
        position="fixed"
        component={motion.div}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        sx={{
          backgroundColor: isScrolled
            ? alpha(isDarkMode ? "#0a0e27" : "#ffffff", 0.95)
            : isDarkMode
            ? "#0a0e27"
            : "#ffffff",
          backdropFilter: isScrolled ? "blur(20px)" : "none",
          transition: "all 0.3s ease",
          boxShadow: isScrolled ? 2 : 0,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 0, sm: 2 }, minHeight: { xs: 64, sm: 70 } }}>
            {/* Logo */}
            <Box
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                mr: 4,
              }}
            >
              <MovieIcon
                sx={{
                  fontSize: 32,
                  mr: 1,
                  color: "primary.main",
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background: isDarkMode
                    ? "linear-gradient(45deg, #90caf9 30%, #f48fb1 90%)"
                    : "linear-gradient(45deg, #2196f3 30%, #f50057 90%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: { xs: "none", sm: "block" },
                }}
              >
                CineStream
              </Typography>
            </Box>

            {/* Navigation Links */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, mr: 2 }}>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: alpha(isDarkMode ? "#fff" : "#000", 0.05),
                  },
                }}
              >
                Películas
              </Button>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: alpha(isDarkMode ? "#fff" : "#000", 0.05),
                  },
                }}
              >
                Series
              </Button>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCategoryClick}
                endIcon={<FilterIcon />}
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: alpha(isDarkMode ? "#fff" : "#000", 0.05),
                  },
                }}
              >
                Géneros
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCategoryClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    maxHeight: 400,
                    width: 250,
                  },
                }}
              >
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <MenuItem key={category._id} onClick={handleCategoryClose}>
                      {category.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No hay géneros disponibles</MenuItem>
                )}
              </Menu>
            </Box>

            {/* Search Bar */}
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                position: "relative",
                borderRadius: 3,
                backgroundColor: alpha(isDarkMode ? "#fff" : "#000", isDarkMode ? 0.05 : 0.04),
                "&:hover": {
                  backgroundColor: alpha(isDarkMode ? "#fff" : "#000", isDarkMode ? 0.08 : 0.06),
                },
                "&:focus-within": {
                  backgroundColor: alpha(isDarkMode ? "#fff" : "#000", isDarkMode ? 0.1 : 0.08),
                  boxShadow: `0 0 0 2px ${alpha(isDarkMode ? "#90caf9" : "#2196f3", 0.3)}`,
                },
                ml: { xs: 1, md: 0 },
                mr: 2,
                width: { xs: "auto", sm: "300px", md: "400px" },
                flexGrow: { xs: 1, sm: 0 },
                transition: "all 0.3s ease",
              }}
            >
              <Box
                sx={{
                  padding: "0 16px",
                  height: "100%",
                  position: "absolute",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SearchIcon sx={{ color: "text.secondary" }} />
              </Box>
              <InputBase
                placeholder="Buscar películas, series..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{
                  color: "text.primary",
                  width: "100%",
                  "& .MuiInputBase-input": {
                    padding: "12px 12px 12px 48px",
                    transition: "width 0.3s",
                    fontSize: "0.95rem",
                  },
                }}
              />
            </Box>

            {/* Right Side Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Theme Toggle */}
              <IconButton
                component={motion.button}
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                sx={{
                  color: "text.primary",
                  transition: "all 0.3s ease",
                }}
              >
                {isDarkMode ? <LightIcon /> : <DarkIcon />}
              </IconButton>

              {/* Conditional Rendering: Authenticated vs Not Authenticated */}
              {isAuthenticated ? (
                <>
                  {/* Dashboard Button (Solo para admins) */}
                  {user?.role === "admin" && (
                    <Button
                      component={motion.button}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      startIcon={<DashboardIcon />}
                      onClick={() => navigate("/admin/dashboard")}
                      sx={{
                        display: { xs: "none", sm: "flex" },
                        color: "text.primary",
                        fontWeight: 600,
                        px: 2,
                        "&:hover": {
                          backgroundColor: alpha(isDarkMode ? "#fff" : "#000", 0.05),
                        },
                      }}
                    >
                      Dashboard
                    </Button>
                  )}

                  {/* Profile Menu */}
                  <IconButton
                    component={motion.button}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleProfileMenuOpen}
                    sx={{
                      color: "text.primary",
                    }}
                  >
                    <AccountCircleIcon sx={{ fontSize: 32 }} />
                  </IconButton>

                  <Menu
                    anchorEl={profileAnchorEl}
                    open={Boolean(profileAnchorEl)}
                    onClose={handleProfileMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 200,
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {user?.name || "Usuario"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user?.email}
                      </Typography>
                      {user?.role === "admin" && (
                        <Chip
                          label="Admin"
                          size="small"
                          color="primary"
                          sx={{ mt: 0.5, height: 20, fontSize: "0.7rem" }}
                        />
                      )}
                    </Box>
                    {user?.role === "admin" && (
                      <MenuItem
                        onClick={() => {
                          handleProfileMenuClose();
                          navigate("/admin/dashboard");
                        }}
                      >
                        <DashboardIcon sx={{ mr: 1, fontSize: 20 }} />
                        Dashboard
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                      Cerrar Sesión
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  {/* Login Button */}
                  <Button
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    startIcon={<LoginIcon />}
                    onClick={() => navigate("/login")}
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      color: "text.primary",
                      fontWeight: 600,
                      px: 2,
                      "&:hover": {
                        backgroundColor: alpha(isDarkMode ? "#fff" : "#000", 0.05),
                      },
                    }}
                  >
                    Iniciar Sesión
                  </Button>

                  {/* Register Button */}
                  <Button
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    startIcon={<RegisterIcon />}
                    onClick={() => navigate("/register")}
                    variant="contained"
                    sx={{
                      display: { xs: "none", md: "flex" },
                      background: isDarkMode
                        ? "linear-gradient(45deg, #90caf9 30%, #f48fb1 90%)"
                        : "linear-gradient(45deg, #2196f3 30%, #f50057 90%)",
                      fontWeight: 600,
                      px: 3,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      "&:hover": {
                        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)",
                      },
                    }}
                  >
                    Registrarse
                  </Button>

                  {/* Mobile Login Icon */}
                  <IconButton
                    onClick={() => navigate("/login")}
                    sx={{
                      display: { xs: "flex", sm: "none" },
                      color: "text.primary",
                    }}
                  >
                    <LoginIcon />
                  </IconButton>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
};

export default PublicNavBar;
