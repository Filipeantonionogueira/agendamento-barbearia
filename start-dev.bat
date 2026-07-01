@echo off
cd /d "%~dp0"
echo Iniciando banco local...
start "barbearia-db" cmd /k "cd /d backend && node scripts/start-db.js"

echo Aguardando banco e preparando tabelas...
cd /d "%~dp0backend"
node scripts/wait-for-db.js
if errorlevel 1 goto erro
node scripts/apply-migration.js
if errorlevel 1 goto erro
call npx.cmd prisma db seed
if errorlevel 1 goto erro
cd /d "%~dp0"

echo Iniciando backend e frontend...
start "barbearia-backend" cmd /k "cd /d backend && call npm.cmd run dev"
timeout /t 4 /nobreak > nul
start "barbearia-frontend" cmd /k "cd /d frontend && call npm.cmd run dev"
echo.
echo Barbearia iniciada:
echo - Banco: localhost:5432
echo - Backend: http://localhost:3333/api/health
echo - Frontend: http://localhost:5173
echo.
echo Se o navegador nao abrir sozinho, acesse http://localhost:5173
pause
exit /b 0

:erro
echo.
echo Nao consegui iniciar tudo. Veja a mensagem de erro acima.
pause
exit /b 1
