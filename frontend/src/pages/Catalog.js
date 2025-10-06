import React from 'react';
import { Box } from '@mui/material';
import MovieCatalog from '../components/catalog/MovieCatalog';

/**
 * Catalog Page
 * Public page for displaying the movie and series catalog
 * This is the main page that users will see when browsing content
 */
const Catalog = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <MovieCatalog />
    </Box>
  );
};

export default Catalog;