@echo off
title Socialise App Server
echo Starting Socialise...
echo.
echo [1/2] Checking dependencies...
call npm install
echo.
echo [2/2] Launching Server on Network...
echo.
echo ***************************************************
echo *  Socialise is running!                          *
echo *  Local:   http://localhost:5173                *
echo *  Network: (See 'Network' IP below)             *
echo ***************************************************
echo.
echo Opening browser...
start "" "http://localhost:5173"
echo.
echo Press Ctrl+C to stop the server (or close this window).
echo.
npm run dev
pause
