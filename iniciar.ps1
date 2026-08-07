$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Detect correct Python executable
$pythonCmd = "python"
if (-not (Get-Command "python" -ErrorAction SilentlyContinue)) {
    if (Get-Command "py" -ErrorAction SilentlyContinue) {
        $pythonCmd = "py"
    } else {
        Write-Error "No se encontro 'python' ni 'py' en el sistema. Asegurate de tener Python instalado."
        exit 1
    }
}

# Detect correct npx executable
$npxCmd = "npx.cmd"
if (-not (Get-Command "npx.cmd" -ErrorAction SilentlyContinue)) {
    if (Get-Command "npx" -ErrorAction SilentlyContinue) {
        $npxCmd = "npx"
    } else {
        Write-Error "No se encontro 'npx' en el sistema. Asegurate de tener Node.js instalado."
        exit 1
    }
}

Write-Host "Iniciando backend Django con $pythonCmd..." -ForegroundColor Green
$backend = Start-Process -NoNewWindow -PassThru -FilePath $pythonCmd -ArgumentList "manage.py runserver 8000" -WorkingDirectory "$root\backend"

Write-Host "Iniciando frontend React con $npxCmd..." -ForegroundColor Green
$frontend = Start-Process -NoNewWindow -PassThru -FilePath $npxCmd -ArgumentList "vite --host" -WorkingDirectory "$root\frontend"

Write-Host ""
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:8000/api/tasks/" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona cualquier tecla para detener ambos servidores..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
Write-Host "Servidores detenidos." -ForegroundColor Green

