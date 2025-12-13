import React, { useState } from "react";
import { Button, Box, Typography, CircularProgress, Alert, Paper } from "@mui/material";
import { tmdbService } from "../../services/tmdbService";
import { mediaService, genreService, typeService, directorService, producerService } from "../../services";

const DatabaseSeeder = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const addLog = (message) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const handleSeed = async () => {
    setLoading(true);
    setLogs([]);
    setError(null);

    try {
      addLog("Iniciando proceso de sembrado...");

      // 1. Crear Tipo "Película"
      addLog('Verificando Tipo "Película"...');
      let movieType;
      try {
        const typesRes = await typeService.getAll();
        const existingType = typesRes.data.find((t) => t.name === "Película");
        if (existingType) {
          movieType = existingType;
          addLog('Tipo "Película" ya existe.');
        } else {
          const newType = await typeService.create({
            name: "Película",
            description: "Cintas cinematográficas",
          });
          movieType = newType.data;
          addLog('Tipo "Película" creado.');
        }
      } catch (e) {
        addLog("Error en Tipos. Continuando...");
      }

      // 2. Obtener Géneros de TMDB
      addLog("Obteniendo géneros de TMDB...");
      const tmdbGenresRes = await tmdbService.getGenres();
      const genreMap = {};

      if (tmdbGenresRes.success) {
        for (const g of tmdbGenresRes.data) {
          try {
            // Intentar crear (asumiendo que el backend maneja duplicados o fallará)
            const savedGenre = await genreService.create({
              name: g.name,
              status: "Active",
              description: `Género ${g.name}`,
            });
            genreMap[g.id] = savedGenre.data._id;
            addLog(`Género creado: ${g.name}`);
          } catch (e) {
            // Si falla, buscar el existente
            const allGenres = await genreService.getAll();
            const existing = allGenres.data.find((ex) => ex.name === g.name);
            if (existing) genreMap[g.id] = existing._id;
          }
        }
      }

      // 3. Obtener Películas (15)
      addLog("Obteniendo películas populares...");
      const moviesRes = await tmdbService.getMovies({ page: 1 });
      const moviesToProcess = moviesRes.data.media.slice(0, 15);

      for (const movie of moviesToProcess) {
        addLog(`Procesando: ${movie.title}...`);

        const detailsRes = await tmdbService.getMovieDetails(movie._id);
        const details = detailsRes.data;

        // 4. Director
        let directorId = null;
        if (details.director) {
          try {
            const newDirector = await directorService.create({ name: details.director, status: "Active" });
            directorId = newDirector.data._id;
          } catch (e) {
            const allDirectors = await directorService.getAll();
            const existing = allDirectors.data.find((d) => d.name === details.director);
            if (existing) directorId = existing._id;
          }
        }

        // 5. Productora
        let producerId = null;
        if (details.producer) {
          try {
            const newProducer = await producerService.create({
              name: details.producer,
              slogan: "Cinema",
              description: details.producerDescription || "Productora",
              status: "Active",
            });
            producerId = newProducer.data._id;
          } catch (e) {
            const allProducers = await producerService.getAll();
            const existing = allProducers.data.find((p) => p.name === details.producer);
            if (existing) producerId = existing._id;
          }
        }

        // 6. Crear Media
        const localGenreId = genreMap[movie.genreIds[0]];

        const mediaData = {
          serial: `MOV-${movie._id}`,
          title: movie.title,
          synopsis: movie.description || "Sin descripción.",
          url: details.trailerUrl || "https://youtube.com",
          image: movie.posterUrl,
          releaseDate: movie.releaseDate,
          type: movieType?._id,
          genre: localGenreId,
          director: directorId,
          producer: producerId,
        };

        try {
          await mediaService.create(mediaData);
          addLog(`--> GUARDADA: ${movie.title}`);
        } catch (e) {
          addLog(`Error guardando ${movie.title}: ${e.message}`);
        }
      }
      addLog("--- FINALIZADO ---");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto", mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        Carga de Datos (TMDB)
      </Typography>
      <Button variant="contained" onClick={handleSeed} disabled={loading} size="large">
        {loading ? <CircularProgress size={24} /> : "Sembrar 15 Películas"}
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Paper sx={{ mt: 4, p: 2, maxHeight: 400, overflow: "auto", bgcolor: "#f5f5f5" }}>
        {logs.map((log, i) => (
          <Typography key={i} variant="body2" sx={{ fontFamily: "monospace" }}>
            {log}
          </Typography>
        ))}
      </Paper>
    </Box>
  );
};

export default DatabaseSeeder;
