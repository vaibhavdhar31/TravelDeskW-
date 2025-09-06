# JWT Authentication Implementation

## Overview
The SRS Travel Desk backend now uses proper JWT (JSON Web Token) authentication with enhanced security features.

## Key Improvements Made

### 1. JWT Service (`Services/JwtService.cs`)
- **Centralized token management**: All JWT operations handled by a dedicated service
- **Proper token validation**: Includes issuer, audience, and lifetime validation
- **Enhanced security**: Uses longer, more secure secret key
- **Standard claims**: Implements both custom and standard JWT claims

### 2. Updated Configuration (`appsettings.json`)
```json
{
  "Jwt": {
    "Key": "TravelDesk2024SecretKeyForJWTTokenGeneration123456789",
    "Issuer": "TravelDeskApi",
    "Audience": "TravelDeskClient",
    "ExpiryHours": 8
  }
}
```

### 3. Enhanced Authentication Controller (`Controllers/AuthController.cs`)
- **Better error handling**: Comprehensive try-catch blocks
- **Input validation**: Checks for empty email/password
- **Extended token response**: Includes userId, email, and expiration info
- **Token validation endpoint**: New endpoint to verify token validity

### 4. Improved Program.cs Configuration
- **Proper JWT validation**: Validates issuer, audience, and lifetime
- **Token expiration handling**: Custom event handling for expired tokens
- **Zero clock skew**: Eliminates time-based validation issues

### 5. JWT Middleware (`Middleware/JwtMiddleware.cs`)
- **Custom token validation**: Additional layer of token verification
- **Better error responses**: Structured JSON error responses
- **Unauthorized access handling**: Proper HTTP status codes

## Security Features

### Token Structure
- **Claims included**:
  - `NameIdentifier`: User ID
  - `Email`: User email address
  - `Role`: User role (Employee, Manager, Travel Admin)
  - `Sub`: Subject (User ID)
  - `Jti`: Unique token identifier
  - `Iat`: Issued at timestamp

### Validation Parameters
- ✅ **Issuer validation**: Ensures token came from correct source
- ✅ **Audience validation**: Verifies token intended for this application
- ✅ **Lifetime validation**: Checks token hasn't expired
- ✅ **Signature validation**: Verifies token integrity
- ✅ **Zero clock skew**: Eliminates time synchronization issues

### Token Expiration
- **Duration**: 8 hours (configurable)
- **Automatic expiry**: Tokens automatically become invalid after expiration
- **Expiry headers**: Client receives notification when token expires

## API Endpoints

### Authentication
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "employee1@cgi.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "employee",
  "userId": 1,
  "email": "employee1@cgi.com",
  "expiresIn": 28800
}
```

### Token Validation
```bash
POST /api/auth/validate-token
Authorization: Bearer <token>

Response:
{
  "message": "Token is valid",
  "userId": "1"
}
```

## Usage in Protected Endpoints

All protected endpoints now properly validate JWT tokens:

```csharp
[Authorize(Roles = "Employee")]
public class EmployeeController : ControllerBase
{
    [HttpGet("my-requests")]
    public async Task<IActionResult> GetMyRequests()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) 
            return Unauthorized("User ID not found in token.");
        
        int userId = int.Parse(userIdClaim.Value);
        // ... rest of the method
    }
}
```

## Testing the Implementation

### 1. Start the Application
```bash
cd Travel_desk_backend/Travel_desk_backend/TravelDesk_Api
dotnet run
```

### 2. Run the Test Script
```bash
./test-jwt-auth.sh
```

### 3. Manual Testing
```bash
# Login
curl -X POST http://localhost:5088/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee1@cgi.com","password":"password123"}'

# Use token in protected endpoint
curl -X GET http://localhost:5088/api/employee/my-requests \
  -H "Authorization: Bearer <your-token-here>"
```

## Error Handling

### Invalid Credentials
```json
{
  "message": "Invalid email or password"
}
```

### Expired Token
```json
{
  "message": "Invalid or expired token",
  "statusCode": 401
}
```

### Missing Token
```json
{
  "message": "User ID not found in token."
}
```

## Best Practices Implemented

1. **Secure Secret Key**: Long, random key for token signing
2. **Proper Validation**: All JWT validation parameters enabled
3. **Role-Based Access**: Controllers protected by role-based authorization
4. **Error Handling**: Comprehensive error responses
5. **Token Expiration**: Reasonable expiration time (8 hours)
6. **CORS Configuration**: Proper cross-origin resource sharing setup

## Next Steps

1. **Environment Variables**: Move JWT secret to environment variables for production
2. **Refresh Tokens**: Implement refresh token mechanism for better UX
3. **Rate Limiting**: Add rate limiting to login endpoint
4. **Audit Logging**: Log authentication attempts and token usage
5. **HTTPS Only**: Enforce HTTPS in production environment

## Troubleshooting

### Common Issues

1. **Token not working**: Check if token is properly included in Authorization header
2. **CORS errors**: Ensure frontend URL is in CORS policy
3. **Time sync issues**: Clock skew is set to zero to prevent time-related issues
4. **Role access denied**: Verify user has correct role for the endpoint

### Debug Commands
```bash
# Check if API is running
curl http://localhost:5088/api/auth/validate-token

# Test with verbose output
curl -v -X POST http://localhost:5088/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee1@cgi.com","password":"password123"}'
```
