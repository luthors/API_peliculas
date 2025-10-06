import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Rating,
  Button,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Info as InfoIcon,
  Movie as MovieIcon,
  Tv as TvIcon,
} from '@mui/icons-material';

/**
 * MovieCard Component
 * Displays individual movie/series information in a card format
 * Similar to TMDB layout with poster, title, rating, and actions
 */
const MovieCard = ({
  media,
  onPlay,
  onToggleFavorite,
  onShare,
  onViewDetails,
  isFavorite = false,
  showActions = true,
  variant = 'default', // 'default', 'compact', 'detailed'
}) => {
  // Format release date
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Get average rating
  const getAverageRating = () => {
    if (!media.rating) return 0;
    
    const ratings = [];
    if (media.rating.imdb?.score) ratings.push(media.rating.imdb.score);
    if (media.rating.metacritic) ratings.push(media.rating.metacritic / 10);
    if (media.rating.rottenTomatoes) ratings.push(media.rating.rottenTomatoes / 10);
    
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  };

  // Get type icon and color
  const getTypeInfo = () => {
    const typeName = media.type?.name || '';
    if (typeName.toLowerCase().includes('serie') || typeName.toLowerCase().includes('tv')) {
      return { icon: <TvIcon />, color: 'secondary', label: 'Serie' };
    }
    return { icon: <MovieIcon />, color: 'primary', label: 'Película' };
  };

  const typeInfo = getTypeInfo();
  const averageRating = getAverageRating();
  const releaseYear = media.releaseDate ? new Date(media.releaseDate).getFullYear() : null;

  // Placeholder image if no poster available
  const posterUrl = media.poster || '/placeholder-movie.jpg';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
        borderRadius: 2,
        overflow: 'hidden',
      }}
      onClick={() => onViewDetails && onViewDetails(media)}
    >
      {/* Poster Image */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height={variant === 'compact' ? 200 : 300}
          image={posterUrl}
          alt={media.title}
          sx={{
            objectFit: 'cover',
            backgroundColor: 'grey.200',
          }}
          onError={(e) => {
            e.target.src = '/placeholder-movie.jpg';
          }}
        />
        
        {/* Type Badge */}
        <Chip
          icon={typeInfo.icon}
          label={typeInfo.label}
          color={typeInfo.color}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            '& .MuiChip-icon': {
              color: 'white',
            },
          }}
        />

        {/* Rating Badge */}
        {averageRating > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Typography variant="caption" fontWeight="bold">
              {averageRating.toFixed(1)}
            </Typography>
            <Rating
              value={averageRating / 2}
              precision={0.1}
              size="small"
              readOnly
              sx={{
                '& .MuiRating-icon': {
                  fontSize: '0.8rem',
                },
              }}
            />
          </Box>
        )}

        {/* Play Button Overlay */}
        {showActions && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0,
              transition: 'opacity 0.3s ease-in-out',
              '.MuiCard-root:hover &': {
                opacity: 1,
              },
            }}
          >
            <IconButton
              size="large"
              onClick={(e) => {
                e.stopPropagation();
                onPlay && onPlay(media);
              }}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                },
              }}
            >
              <PlayIcon fontSize="large" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: variant === 'compact' ? '1rem' : '1.1rem',
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {media.title}
        </Typography>

        {/* Release Year and Duration */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {releaseYear && (
            <Chip
              label={releaseYear}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
          {media.duration && (
            <Typography variant="caption" color="text.secondary">
              {formatDuration(media.duration)}
            </Typography>
          )}
        </Box>

        {/* Genres */}
        {media.genres && media.genres.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {media.genres.slice(0, 3).map((genre) => (
              <Chip
                key={genre._id || genre.id}
                label={genre.name}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            ))}
            {media.genres.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                +{media.genres.length - 3} más
              </Typography>
            )}
          </Box>
        )}

        {/* Synopsis (only in detailed variant) */}
        {variant === 'detailed' && media.synopsis && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mt: 1,
            }}
          >
            {media.synopsis}
          </Typography>
        )}
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Box>
              <Tooltip title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite && onToggleFavorite(media);
                  }}
                  color={isFavorite ? 'error' : 'default'}
                >
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Compartir">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare && onShare(media);
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Button
              size="small"
              startIcon={<InfoIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails && onViewDetails(media);
              }}
            >
              Detalles
            </Button>
          </Box>
        </CardActions>
      )}
    </Card>
  );
};

export default MovieCard;