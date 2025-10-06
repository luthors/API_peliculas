# Script para crear todos los objetos media de los archivos peliculajson en la base de datos

$peliculajsonPath = "peliculajson"
$apiUrl = "http://localhost:3001/api/v1/bulk/media"

# Obtener todos los archivos JSON de la carpeta peliculajson
$jsonFiles = Get-ChildItem -Path $peliculajsonPath -Filter "*.json" | Sort-Object Name

Write-Host "Encontrados $($jsonFiles.Count) archivos para procesar"
Write-Host "Iniciando creación masiva de objetos media..."
Write-Host "=" * 50

$totalProcessed = 0
$totalErrors = 0

foreach ($file in $jsonFiles) {
    Write-Host "Procesando: $($file.Name)"
    
    try {
        # Ejecutar curl para crear los objetos media
        $curlCommand = "curl -X POST `"$apiUrl`" -H `"Content-Type: application/json`" -d `"@$($file.FullName)`""
        $result = Invoke-Expression $curlCommand
        
        # Verificar si el comando fue exitoso
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Comando ejecutado exitosamente" -ForegroundColor Green
            Write-Host "  📝 Respuesta: $result" -ForegroundColor Cyan
            $totalProcessed++
        } else {
            Write-Host "  ❌ Error en comando curl (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
            $totalErrors++
        }
    }
    catch {
        Write-Host "  ❌ Excepción: $($_.Exception.Message)" -ForegroundColor Red
        $totalErrors++
    }
    
    Write-Host ""
    Start-Sleep -Milliseconds 1000  # Pausa entre requests
}

Write-Host "=" * 50
Write-Host "RESUMEN FINAL:" -ForegroundColor Yellow
Write-Host "Archivos procesados exitosamente: $totalProcessed" -ForegroundColor Green
Write-Host "Errores encontrados: $totalErrors" -ForegroundColor $(if ($totalErrors -eq 0) { "Green" } else { "Red" })

if ($totalErrors -eq 0) {
    Write-Host "🎉 ¡Proceso completado exitosamente!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Proceso completado con algunos errores" -ForegroundColor Yellow
}