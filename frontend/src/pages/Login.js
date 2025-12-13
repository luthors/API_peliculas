import React, { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Movie as MovieIcon } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

/**
 * Esquema de validación para el formulario de login
 */
const loginSchema = yup.object().shape({
  email: yup.string().email("Email inválido").required("El email es obligatorio"),
  password: yup
    .string()
    .required("La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

/**
 * Página de Login
 * Permite a los usuarios iniciar sesión en el sistema
 */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  /**
   * Manejar el envío del formulario
   */
  const onSubmit = async (data) => {
    try {
      setError("");
      setIsSubmitting(true);

      await login(data);

      // Redirigir a la página anterior o al dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
          }}
        >
          {/* Logo y título */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <MovieIcon sx={{ color: "white", fontSize: 32 }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Iniciar Sesión
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Sistema de Gestión de Películas y Series
            </Typography>
          </Box>

          {/* Mostrar error si existe */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              autoFocus
              margin="normal"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isSubmitting}
            />

            {/* Contraseña */}
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              margin="normal"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Botón de envío */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5568d3 0%, #6a4293 100%)",
                },
              }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Iniciar Sesión"}
            </Button>

            {/* Enlaces */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                ¿No tienes una cuenta?{" "}
                <Link component={RouterLink} to="/register" underline="hover" fontWeight="bold">
                  Regístrate aquí
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <Link component={RouterLink} to="/catalog" underline="hover" fontWeight="bold">
                  Ver catálogo sin registrarse
                </Link>
              </Typography>
            </Box>
          </form>

          {/* Credenciales de prueba */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: "info.main",
              color: "white",
            }}
          >
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Credenciales de Prueba:
            </Typography>
            <Typography variant="caption" component="div">
              Admin: admin@peliculas.com / Admin123
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
