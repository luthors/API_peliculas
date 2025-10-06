# Script para procesar peliculas.json y dividirlo en archivos más pequeños con IDs correctos

# Mapeo de IDs de la base de datos
$typeIds = @{
    "Película" = "68e2cd77e06821ba04090350"
    "Serie" = "68e2cd77e06821ba04090351"
    "Documental" = "68e2cd77e06821ba04090352"
}

$genreIds = @{
    "Acción" = "68e2ccbee06821ba04090342"
    "Ciencia Ficción" = "68e2ccbee06821ba04090343"
    "Drama" = "68e2ccbee06821ba04090344"
    "Comedia" = "68e2ccbee06821ba04090345"
    "Terror" = "68e2ccbee06821ba04090346"
    "Aventura" = "68e2ccbee06821ba04090342"  # Usando Acción como equivalente
}

$directorIds = @{
    "Christopher Nolan" = "68e2cde5e06821ba0409035b"
    "Martin Scorsese" = "68e2cde5e06821ba0409035d"
    "Quentin Tarantino" = "68e2cde5e06821ba0409035c"
}

$producerIds = @{
    "Warner Bros Pictures" = "68e2cdf1e06821ba0409035f"
    "Sony Pictures Entertainment" = "68e2cdf1e06821ba04090360"
    "Legendary Entertainment" = "68e2cdf1e06821ba04090361"
    "Marvel Studios" = "68e2cdf1e06821ba04090360"  # Usando Sony como equivalente
}

# Leer el archivo JSON
$peliculas = Get-Content "peliculas.json" | ConvertFrom-Json

# Función para actualizar IDs en un objeto película
function Update-MovieIds {
    param($movie)
    
    # Actualizar type ID (por defecto usar Película)
    $movie.type = $typeIds["Película"]
    
    # Actualizar director ID
    if ($directorIds.ContainsKey($movie.director)) {
        $movie.director = $directorIds[$movie.director]
    } else {
        # Si no existe, usar Christopher Nolan por defecto
        $movie.director = $directorIds["Christopher Nolan"]
    }
    
    # Actualizar producer ID
    if ($producerIds.ContainsKey($movie.producer)) {
        $movie.producer = $producerIds[$movie.producer]
    } else {
        # Si no existe, usar Warner Bros por defecto
        $movie.producer = $producerIds["Warner Bros Pictures"]
    }
    
    # Actualizar genres (convertir a array de IDs)
    $genreIdArray = @()
    foreach ($genre in $movie.genres) {
        if ($genreIds.ContainsKey($genre)) {
            $genreIdArray += $genreIds[$genre]
        } elseif ($genre -eq "Ciencia ficción") {
            # Manejar variación de "Ciencia ficción"
            $genreIdArray += $genreIds["Ciencia Ficción"]
        } else {
            # Si no existe, usar Acción por defecto
            $genreIdArray += $genreIds["Acción"]
        }
    }
    $movie.genres = $genreIdArray
    
    return $movie
}

# Procesar y dividir en archivos de 5 objetos cada uno
$totalMovies = $peliculas.Count
$moviesPerFile = 5
$fileCount = [Math]::Ceiling($totalMovies / $moviesPerFile)

Write-Host "Total de películas: $totalMovies"
Write-Host "Archivos a crear: $fileCount"

for ($i = 0; $i -lt $fileCount; $i++) {
    $startIndex = $i * $moviesPerFile
    $endIndex = [Math]::Min(($i + 1) * $moviesPerFile - 1, $totalMovies - 1)
    
    $moviesForFile = @()
    for ($j = $startIndex; $j -le $endIndex; $j++) {
        $updatedMovie = Update-MovieIds -movie $peliculas[$j]
        $moviesForFile += $updatedMovie
    }
    
    # Crear el objeto con estructura de media
    $mediaObject = @{
        media = $moviesForFile
    }
    
    $fileName = "peliculajson\peliculasjson$($i + 1).json"
    $mediaObject | ConvertTo-Json -Depth 10 | Out-File -FilePath $fileName -Encoding UTF8
    
    Write-Host "Creado: $fileName con $($moviesForFile.Count) películas"
}

Write-Host "Proceso completado. Se crearon $fileCount archivos en la carpeta peliculajson."