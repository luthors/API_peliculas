# Script para crear todos los objetos media de los archivos peliculajson en la base de datos

$peliculajsonPath = "peliculajson"
$apiUrl = "http://localhost:3001/api/v1/bulk/media"

# Obtener todos los archivos JSON de la carpeta peliculajson
$jsonFiles = Get-ChildItem -Path $peliculajsonPath -Filter "*.json" | Sort-Object Name

Write-Host "Encontrados $($jsonFiles.Count) archivos para procesar"
Write-Host "Iniciando creación masiva de objetos media..."
Write-Host "=" * 50

$totalCreated = 0
$totalErrors = 0

foreach ($file in $jsonFiles) {
    Write-Host "Procesando: $($file.Name)"
    
    try {
        # Ejecutar curl para crear los objetos media
        $result = curl -X POST $apiUrl -H "Content-Type: application/json" -d "@$($file.FullName)" 2>&1
        
        # Verificar si el comando fue exitoso
        if ($LASTEXITCODE -eq 0) {
            # Parsear la respuesta JSON
            $response = $result | ConvertFrom-Json
            
            if ($response.success) {
                $created = $response.data.created
                $total = $response.data.total
                $totalCreated += $created
                
                Write-Host "  ✅ Éxito: $created de $total objetos creados" -ForegroundColor Green
                
                # Mostrar los IDs creados si están disponibles
                if ($response.data.media) {
                    $ids = $response.data.media.PSObject.Properties.Value
                    Write-Host "  📝 IDs creados: $($ids -join ', ')" -ForegroundColor Cyan
                }
            } else {
                Write-Host "  ❌ Error en respuesta: $($response.message)" -ForegroundColor Red
                $totalErrors++
            }
        } else {
            Write-Host "  ❌ Error en comando curl" -ForegroundColor Red
            Write-Host "  Detalles: $result" -ForegroundColor Yellow
            $totalErrors++
        }
    }
    catch {
        Write-Host "  ❌ Excepción: $($_.Exception.Message)" -ForegroundColor Red
        $totalErrors++
    }
    
    Write-Host ""
    Start-Sleep -Milliseconds 500  # Pequeña pausa entre requests
}

Write-Host "=" * 50
Write-Host "RESUMEN FINAL:" -ForegroundColor Yellow
Write-Host "Archivos procesados: $($jsonFiles.Count)"
Write-Host "Total objetos media creados: $totalCreated" -ForegroundColor Green
Write-Host "Errores encontrados: $totalErrors" -ForegroundColor $(if ($totalErrors -eq 0) { "Green" } else { "Red" })

if ($totalErrors -eq 0) {
    Write-Host "🎉 ¡Proceso completado exitosamente!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Proceso completado con algunos errores" -ForegroundColor Yellow
}