import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff, Movie as MovieIcon } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

/**
 * Esquema de validación para el formulario de registro
 */
const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .required("El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
  lastName: yup
    .string()
    .required("El apellido es obligatorio")
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El apellido solo puede contener letras y espacios"),
  email: yup.string().email("Email inválido").required("El email es obligatorio"),
  password: yup
    .string()
    .required("La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    ),
  confirmPassword: yup
    .string()
    .required("Confirma tu contraseña")
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden"),
});

/**
 * Página de Registro
 * Permite a los usuarios crear una nueva cuenta
 */
const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  /**
   * Manejar el envío del formulario
   */
  const onSubmit = async (data) => {
    try {
      setError("");
      setSuccess("");
      setIsSubmitting(true);

      // Eliminar confirmPassword antes de enviar
      const { confirmPassword, ...userData } = data;

      await registerUser(userData);

      setSuccess("¡Cuenta creada exitosamente! Redirigiendo...");

      // Redirigir al dashboard después de 1.5 segundos
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      setError(err.message || "Error al crear la cuenta. Intenta nuevamente.");
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
      <Container maxWidth="md">
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
              Crear Cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Regístrate para acceder al sistema
            </Typography>
          </Box>

          {/* Mostrar error o éxito */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              {/* Nombre */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  autoComplete="given-name"
                  autoFocus
                  {...register("firstName")}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  disabled={isSubmitting}
                />
              </Grid>

              {/* Apellido */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  autoComplete="family-name"
                  {...register("lastName")}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  disabled={isSubmitting}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isSubmitting}
                />
              </Grid>

              {/* Contraseña */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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
              </Grid>

              {/* Confirmar contraseña */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirmar Contraseña"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  disabled={isSubmitting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          disabled={isSubmitting}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Información de contraseña */}
            <Alert severity="info" sx={{ mt: 2 }}>
              La contraseña debe tener al menos 6 caracteres y contener una mayúscula, una minúscula y un número.
            </Alert>

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
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Crear Cuenta"}
            </Button>

            {/* Enlaces */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                ¿Ya tienes una cuenta?{" "}
                <Link component={RouterLink} to="/login" underline="hover" fontWeight="bold">
                  Inicia sesión aquí
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <Link component={RouterLink} to="/catalog" underline="hover" fontWeight="bold">
                  Ver catálogo sin registrarse
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
