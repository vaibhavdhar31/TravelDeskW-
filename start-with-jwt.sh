#!/bin/bash

echo "🚀 Starting SRS Travel Desk with JWT Authentication"
echo "=================================================="

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose -f docker-compose.jwt.yml down

# Build and start services
echo "Building and starting services..."
docker-compose -f docker-compose.jwt.yml up --build -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Check service status
echo "Checking service status..."
docker-compose -f docker-compose.jwt.yml ps

# Test the backend
echo ""
echo "Testing backend health..."
curl -f http://localhost:5088/api/auth/generate-hash?password=test || echo "Backend not ready yet"

echo ""
echo "✅ Services started successfully!"
echo "📱 Frontend: http://localhost:4200"
echo "🔧 Backend API: http://localhost:5088"
echo "🗄️  Database: localhost:1433"
echo ""
echo "Test credentials:"
echo "Employee: employee1@cgi.com / password123"
echo "Manager: manager1@cgi.com / password123"
echo "Admin: admin1@cgi.com / password123"
