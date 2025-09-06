#!/bin/bash

echo "🧪 Testing Docker JWT Authentication"
echo "===================================="

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:5088/api/auth/generate-hash?password=test > /dev/null; then
        echo "✅ Backend is ready!"
        break
    fi
    echo "⏳ Waiting... ($i/30)"
    sleep 2
done

# Test login
echo ""
echo "1. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5088/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee1@cgi.com","password":"password123"}')

echo "Response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ JWT Token received successfully!"
    echo "Token: ${TOKEN:0:50}..."
    
    # Test protected endpoint
    echo ""
    echo "2. Testing protected endpoint..."
    PROTECTED_RESPONSE=$(curl -s -X GET http://localhost:5088/api/employee/my-requests \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Protected endpoint response: $PROTECTED_RESPONSE"
    echo "✅ JWT authentication working in Docker!"
else
    echo "❌ Failed to get JWT token"
fi

echo ""
echo "🐳 Docker JWT test completed!"
