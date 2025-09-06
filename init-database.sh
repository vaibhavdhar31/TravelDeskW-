#!/bin/bash

echo "🗄️ Initializing Database for JWT Authentication"
echo "==============================================="

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker-compose -f docker-compose.jwt.yml exec backend dotnet ef database update

echo "✅ Database initialization completed!"
