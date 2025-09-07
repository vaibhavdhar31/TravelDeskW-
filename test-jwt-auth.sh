#!/bin/bash

echo "Testing JWT Authentication for SRS Travel Desk"
echo "=============================================="

# Test login endpoint
echo "1. Testing login with valid credentials..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5088/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee1@cgi.com","password":"password123"}')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token from response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get token from login response"
    exit 1
fi

echo "✅ Token received: ${TOKEN:0:50}..."

# Test protected endpoint with token
echo ""
echo "2. Testing protected endpoint with token..."
PROTECTED_RESPONSE=$(curl -s -X GET http://localhost:5088/api/employee/my-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Protected endpoint response: $PROTECTED_RESPONSE"

# Test token validation endpoint
echo ""
echo "3. Testing token validation..."
VALIDATION_RESPONSE=$(curl -s -X POST http://localhost:5088/api/auth/validate-token \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Token validation response: $VALIDATION_RESPONSE"

# Test with invalid token
echo ""
echo "4. Testing with invalid token..."
INVALID_RESPONSE=$(curl -s -X GET http://localhost:5088/api/employee/my-requests \
  -H "Authorization: Bearer invalid_token_here" \
  -H "Content-Type: application/json")

echo "Invalid token response: $INVALID_RESPONSE"

echo ""
echo "JWT Authentication test completed!"
