const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data storage
let requests = [];
let requestIdCounter = 1;

// Employee endpoints
app.post('/api/employee/create-request', (req, res) => {
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

app.get('/api/employee/my-requests', (req, res) => {
  res.json(requests);
});

// Manager endpoints
app.get('/api/manager/my-requests', (req, res) => {
  const pendingRequests = requests.filter(r => r.status === 'Pending');
  res.json(pendingRequests);
});

app.post('/api/manager/approve/:id', (req, res) => {
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
app.get('/api/admin/all-requests', (req, res) => {
  const managerApprovedRequests = requests.filter(r => r.status === 'Manager Approved');
  res.json(managerApprovedRequests);
});

app.post('/api/admin/approve/:id', (req, res) => {
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
});
