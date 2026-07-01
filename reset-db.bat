@echo off
cd /d "%~dp0"
echo Fechando processos locais do banco...
taskkill /IM postgres.exe /F > nul 2> nul
taskkill /IM node.exe /F > nul 2> nul
echo Removendo banco local quebrado...
rmdir /S /Q "backend\.postgres-data" 2> nul
rmdir /S /Q "backend\.postgres-data-utf8" 2> nul
rmdir /S /Q "backend\.postgres-data-pg16" 2> nul
echo.
echo Banco local resetado.
echo Agora rode:
echo   start-dev.bat
echo.
pause
