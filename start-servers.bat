@echo off
REM Start both backend and frontend servers for HRMS project

echo Starting HRMS Backend and Frontend servers...
echo.

REM Check if backend folder exists
if not exist "server" (
    echo Error: Server folder not found!
    exit /b 1
)

if not exist "client" (
    echo Error: Client folder not found!
    exit /b 1
)

REM Start backend in a new window
echo Starting backend server (http://localhost:5000)...
start cmd /k "cd server && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend in a new window
echo Starting frontend server (http://localhost:5173)...
start cmd /k "cd client && npm run dev"

echo.
echo Both servers are starting. Check the new windows for output.
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause
