@echo off
echo Travel Desk Docker Management
echo ===============================
echo.
echo 1. Start Development Mode (Mock Backend + Angular)
echo 2. Start Production Mode (.NET API + Angular)
echo 3. Stop All Services
echo 4. View Logs
echo 5. Clean Up (Remove all containers and volumes)
echo 6. Database Migration
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    echo Starting Development Mode...
    docker-compose -f docker-compose.dev.yml up --build
) else if "%choice%"=="2" (
    echo Starting Production Mode...
    docker-compose up --build -d
    echo Services started in background
    echo Frontend: http://localhost
    echo Backend API: http://localhost:5000
) else if "%choice%"=="3" (
    echo Stopping all services...
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
) else if "%choice%"=="4" (
    set /p service="Enter service name (database/backend/frontend/mock-backend): "
    docker-compose logs -f %service%
) else if "%choice%"=="5" (
    echo Cleaning up all containers and volumes...
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
) else if "%choice%"=="6" (
    echo Running database migrations...
    docker-compose exec backend dotnet ef database update
) else (
    echo Invalid choice!
)

pause
