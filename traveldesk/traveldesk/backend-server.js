const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();

app.use(cors());
app.use(express.json());

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'TravelDesk2024SecretKeyForJWTTokenGeneration123456789';
const JWT_ISSUER = process.env.JWT_ISSUER || 'TravelDeskApi';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'TravelDeskClient';

// Mock data storage
let requests = [];
let requestIdCounter = 1;

// Mock users with hashed passwords
const users = [
  { 
    id: 1, 
    email: 'employee1@cgi.com', 
    password: '$2a$11$sHvgVn9JtXDUSB6fN162VuzA5Z1H1a0lpVIYGCPeQTUPYlJxCG5q6', // password123
    role: 'Employee', 
    name: 'John Employee' 
  },
  { 
    id: 2, 
    email: 'manager1@cgi.com', 
    password: '$2a$11$sHvgVn9JtXDUSB6fN162VuzA5Z1H1a0lpVIYGCPeQTUPYlJxCG5q6', // password123
    role: 'Manager', 
    name: 'Jane Manager' 
  },
  { 
    id: 3, 
    email: 'admin1@cgi.com', 
    password: '$2a$11$sHvgVn9JtXDUSB6fN162VuzA5Z1H1a0lpVIYGCPeQTUPYlJxCG5q6', // password123
    role: 'Travel Admin', 
    name: 'Bob Admin' 
  }
];

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE }, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    {
      expiresIn: '8h',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    }
  );
};

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = users.find(u => u.email === email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const token = generateToken(user);
      
      console.log('Login successful:', user.email, 'Role:', user.role);
      
      res.json({
        token: token,
        role: user.role.toLowerCase().replace(' ', '-'),
        userId: user.id,
        email: user.email,
        expiresIn: 28800 // 8 hours in seconds
      });
    } else {
      console.log('Login failed for:', email);
      res.status(401).json({
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'An error occurred during login',
      error: error.message
    });
  }
});

// Token validation endpoint
app.post('/api/auth/validate-token', authenticateToken, (req, res) => {
  res.json({
    message: 'Token is valid',
    userId: req.user.sub
  });
});

// Password hash generator (for testing)
app.get('/api/auth/generate-hash', async (req, res) => {
  const { password } = req.query;
  if (!password) {
    return res.status(400).json({ message: 'Password parameter required' });
  }
  
  const hash = await bcrypt.hash(password, 11);
  res.json({ hash });
});

// Employee endpoints
app.post('/api/employee/create-request', authenticateToken, (req, res) => {
  const request = {
    requestId: requestIdCounter++,
    ...req.body,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  
  requests.push(request);
  console.log('Request created:', request);
  
  res.json({ 
    success: true, 
    requestId: request.requestId,
    message: 'Request created successfully' 
  });
});

app.get('/api/employee/my-requests', authenticateToken, (req, res) => {
  const userId = parseInt(req.user.sub);
  const userRequests = requests.filter(r => r.userId === userId);
  res.json(userRequests);
});

// Manager endpoints
app.get('/api/manager/my-requests', authenticateToken, (req, res) => {
  const pendingRequests = requests.filter(r => r.status === 'Pending');
  res.json(pendingRequests);
});

app.post('/api/manager/approve/:id', authenticateToken, (req, res) => {
  const requestId = parseInt(req.params.id);
  const request = requests.find(r => r.requestId === requestId);
  
  if (request) {
    request.status = 'Manager Approved';
    request.managerApprovedAt = new Date().toISOString();
    console.log('Request approved by manager:', requestId);
    
    res.json({ 
      success: true, 
      message: 'Request approved by manager' 
    });
  } else {
    res.status(404).json({ 
      success: false, 
      message: 'Request not found' 
    });
  }
});

// Travel Admin endpoints
app.get('/api/admin/all-requests', authenticateToken, (req, res) => {
  const managerApprovedRequests = requests.filter(r => r.status === 'Manager Approved');
  res.json(managerApprovedRequests);
});

app.post('/api/admin/approve/:id', authenticateToken, (req, res) => {
  const requestId = parseInt(req.params.id);
  const request = requests.find(r => r.requestId === requestId);
  
  if (request) {
    request.status = 'Completed';
    request.adminApprovedAt = new Date().toISOString();
    console.log('Request completed by travel-admin:', requestId);
    
    res.json({ 
      success: true, 
      message: 'Request completed by travel-admin' 
    });
  } else {
    res.status(404).json({ 
      success: false, 
      message: 'Request not found' 
    });
  }
});

// Start server
const PORT = 5088;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Available test users:');
  console.log('- employee1@cgi.com / password123 (employee)');
  console.log('- manager1@cgi.com / password123 (manager)');
  console.log('- admin1@cgi.com / password123 (travel-admin)');
});
