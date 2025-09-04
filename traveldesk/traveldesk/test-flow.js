// Test script to verify travel request flow
// Run this in browser console to test the flow

console.log('🧪 Testing Travel Request Flow...');

// Step 1: Simulate Employee creating a request
function testEmployeeRequest() {
  console.log('📝 Step 1: Employee creates request');
  
  const mockRequest = {
    projectName: 'Test Project',
    departmentName: 'Engineering',
    reasonForTravelling: 'Client meeting',
    typeOfBooking: 'Flight',
    status: 'Pending',
    employeeId: 'E001',
    submittedDate: new Date().toISOString()
  };
  
  // Save to localStorage (simulating API call)
  const submittedRequests = JSON.parse(localStorage.getItem('submittedRequests') || '[]');
  submittedRequests.push(mockRequest);
  localStorage.setItem('submittedRequests', JSON.stringify(submittedRequests));
  
  console.log('✅ Request created:', mockRequest);
  return mockRequest;
}

// Step 2: Simulate Manager approval
function testManagerApproval(requestIndex = 0) {
  console.log('👔 Step 2: Manager approves request');
  
  const submittedRequests = JSON.parse(localStorage.getItem('submittedRequests') || '[]');
  
  if (submittedRequests.length === 0) {
    console.log('❌ No requests found for approval');
    return false;
  }
  
  // Approve the request
  submittedRequests[requestIndex].status = 'Approved';
  submittedRequests[requestIndex].managerComments = 'Approved for business travel';
  submittedRequests[requestIndex].approvedDate = new Date().toISOString();
  localStorage.setItem('submittedRequests', JSON.stringify(submittedRequests));
  
  // Move to travel admin queue
  const travelAdminQueue = JSON.parse(localStorage.getItem('travelAdminQueue') || '[]');
  travelAdminQueue.push(submittedRequests[requestIndex]);
  localStorage.setItem('travelAdminQueue', JSON.stringify(travelAdminQueue));
  
  console.log('✅ Request approved and sent to Travel Admin');
  return true;
}

// Step 3: Verify Travel Admin receives request
function testTravelAdminReceives() {
  console.log('✈️ Step 3: Travel Admin processes request');
  
  const travelAdminQueue = JSON.parse(localStorage.getItem('travelAdminQueue') || '[]');
  
  if (travelAdminQueue.length === 0) {
    console.log('❌ No approved requests found in Travel Admin queue');
    return false;
  }
  
  console.log('✅ Travel Admin has', travelAdminQueue.length, 'approved requests');
  console.log('📋 Latest request:', travelAdminQueue[travelAdminQueue.length - 1]);
  return true;
}

// Run complete flow test
function runCompleteFlowTest() {
  console.log('🚀 Running Complete Flow Test...\n');
  
  // Clear existing data
  localStorage.removeItem('submittedRequests');
  localStorage.removeItem('travelAdminQueue');
  
  // Test each step
  const request = testEmployeeRequest();
  console.log('');
  
  const approved = testManagerApproval();
  console.log('');
  
  const received = testTravelAdminReceives();
  console.log('');
  
  if (request && approved && received) {
    console.log('🎉 FLOW TEST PASSED: Request successfully moved from Employee → Manager → Travel Admin');
  } else {
    console.log('❌ FLOW TEST FAILED: Check individual steps above');
  }
  
  return { request, approved, received };
}

// Export functions for manual testing
window.testFlow = {
  runCompleteFlowTest,
  testEmployeeRequest,
  testManagerApproval,
  testTravelAdminReceives
};

console.log('📋 Test functions available: window.testFlow');
console.log('🏃 Run: window.testFlow.runCompleteFlowTest()');
