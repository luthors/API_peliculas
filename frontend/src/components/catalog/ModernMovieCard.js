import React, { useState } from "react";
import { Card, CardMedia, CardContent, Typography, Box, Chip, IconButton, Skeleton } from "@mui/material";
import { PlayArrow, Info, Star } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useThemeMode } from "../../contexts/ThemeContext";

/**
 * Modern Movie Card Component
 * Professional card with hover effects and animations
 */
const ModernMovieCard = ({ movie, onPlay, onInfo, loading = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDarkMode } = useThemeMode();

  if (loading) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "background.paper",
        }}
      >
        <Skeleton variant="rectangular" height={400} />
        <CardContent>
          <Skeleton width="80%" />
          <Skeleton width="60%" />
        </CardContent>
      </Card>
    );
  }

  const { title, posterUrl, releaseYear, rating = 0, genres = [], type, synopsis } = movie;

  // Fallback image if no poster
  const imageSrc = posterUrl || "https://via.placeholder.com/300x450?text=Sin+Imagen";

  return (
    <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.2 }} style={{ width: "100%" }}>
      <Card
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          bgcolor: "background.paper",
          position: "relative",
          cursor: "pointer",
          "&:hover .card-overlay": { opacity: 1 },
        }}
      >
        {/* Image Container - Fixed exact dimensions */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "360px",
            bgcolor: "grey.900",
            overflow: "hidden",
          }}
        >
          <CardMedia
            component="img"
            image={imageSrc}
            alt={title}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Type Badge */}
          <Chip
            label={type?.name || "Película"}
            size="small"
            color="primary"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              backdropFilter: "blur(4px)",
              fontWeight: 600,
              height: 24,
              boxShadow: 2,
            }}
          />

          {/* Rating Badge */}
          {rating > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                bgcolor: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(4px)",
                borderRadius: 1,
                px: 0.8,
                py: 0.4,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Star sx={{ fontSize: 14, color: "#ffc107" }} />
              <Typography
                variant="caption"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {Number(rating).toFixed(1)}
              </Typography>
            </Box>
          )}

          {/* Hover Overlay */}
          <Box
            className="card-overlay"
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              opacity: 0,
              transition: "opacity 0.3s ease",
            }}
          >
            <IconButton
              onClick={() => onPlay(movie)}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                width: 50,
                height: 50,
                "&:hover": {
                  bgcolor: "primary.dark",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s",
              }}
            >
              <PlayArrow />
            </IconButton>
            <IconButton
              onClick={() => onInfo(movie)}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)",
                },
              }}
            >
              <Info />
            </IconButton>
          </Box>
        </Box>

        {/* Contenido de Texto */}
        <CardContent
          sx={{
            p: 1.5,
            flexGrow: 0,
            flexShrink: 0,
            height: "80px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <Typography
            variant="subtitle2"
            component="h3"
            sx={{
              fontWeight: 700,
              lineHeight: 1.3,
              mb: 0.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              height: "2.6em",
            }}
            title={title}
          >
            {title}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              mt: "auto",
            }}
          >
            {releaseYear}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ModernMovieCard;
