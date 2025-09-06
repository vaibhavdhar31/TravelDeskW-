# Docker Usage Guide - Windows

## Prerequisites
- Docker Desktop for Windows (installed and running)
- WSL2 enabled (recommended)

## Development Mode (with Mock Backend)
```cmd
# Navigate to project directory
cd D:\Git-Final\SRS_Travel_Desk

# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Access:
# - Frontend: http://localhost:4200
# - Mock Backend: http://localhost:5088
# - Database: localhost:1433
```

## Production Mode (with .NET API)
```cmd
# Navigate to project directory
cd D:\Git-Final\SRS_Travel_Desk

# Start production environment
docker-compose up --build -d

# Access:
# - Frontend: http://localhost
# - Backend API: http://localhost:5000
# - Database: localhost:1433
```

## Database Setup (First Time)
```cmd
# Run database migrations
docker-compose exec backend dotnet ef database update
```

## Useful Windows Commands
```cmd
# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Rebuild specific service
docker-compose build [service-name]

# Remove all containers and volumes
docker-compose down -v

# Check running containers
docker ps

# Access container shell
docker-compose exec [service-name] /bin/sh
```

## Windows-Specific Notes
- Use `docker-compose` (not `docker compose` on older versions)
- Ensure Docker Desktop is running before executing commands
- File paths use forward slashes in Docker files (already configured)
- Volume mounts work with WSL2 paths

## Database Connection (SQL Server Management Studio)
- **Server**: localhost,1433
- **Authentication**: SQL Server Authentication
- **Username**: sa
- **Password**: TravelDesk123!
- **Database**: TravelDeskDB

## Troubleshooting
- If ports are busy: `netstat -ano | findstr :1433`
- Restart Docker Desktop if containers won't start
- Check Windows Firewall if connection issues occur
