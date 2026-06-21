@echo off
echo ========================================
echo    NEON ARENA - Запуск игры
echo ========================================

echo Запускаю сервер...
start cmd /k "node server.js"

echo Запускаю клиент (через 3 секунды)...
timeout /t 3 >nul

cd client
npm run dev