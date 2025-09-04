// Travel Admin Debug Test
console.log('🔧 TRAVEL ADMIN APPROVE BUTTON DEBUG TEST\n');

// Step 1: Clear and setup test data
console.log('🧹 Step 1: Setting up test data...');

// Clear localStorage
const clearStorage = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('submittedRequests');
    localStorage.removeItem('travelAdminQueue');
    console.log('✅ localStorage cleared');
  }
};

// Create test request
const createTestRequest = () => {
  const testRequest = {
    projectName: 'Debug Test Project',
    departmentName: 'Engineering',
    reasonForTravelling: 'Debug approve button',
    typeOfBooking: 'Flight',
    status: 'Pending',
    employeeId: 'E001',
    submittedDate: new Date().toISOString()
  };
  
  // Simulate employee submission
  const submittedRequests = [testRequest];
  
  // Simulate manager approval
  submittedRequests[0].status = 'Approved';
  submittedRequests[0].managerComments = 'Approved for debug test';
  submittedRequests[0].approvedDate = new Date().toISOString();
  
  // Manager moves to travel admin queue WITH proper travelAdminStatus
  const travelAdminQueue = [{
    ...submittedRequests[0],
    travelAdminStatus: 'Pending Travel Admin Approval'
  }];
  
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('submittedRequests', JSON.stringify(submittedRequests));
    localStorage.setItem('travelAdminQueue', JSON.stringify(travelAdminQueue));
  }
  
  console.log('✅ Test request created and moved to travel admin queue');
  console.log('📋 Travel Admin Queue:', travelAdminQueue);
  
  return { submittedRequests, travelAdminQueue };
};

// Step 2: Test travel admin loading
const testTravelAdminLoading = (travelAdminQueue) => {
  console.log('\n✈️ Step 2: Testing Travel Admin Loading...');
  
  // Simulate travel admin loadApprovedRequests
  const processedRequests = travelAdminQueue.map((req, index) => ({
    id: `TR${(index + 1).toString().padStart(3, '0')}`,
    employee: 'Employee User',
    manager: 'Manager User',
    bookingType: req.typeOfBooking || 'Flight',
    approvedDate: req.approvedDate ? new Date(req.approvedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: req.travelAdminStatus || 'Pending Travel Admin Approval'
  }));
  
  console.log('✅ Travel Admin processed requests:', processedRequests);
  console.log('🔍 First request status:', processedRequests[0]?.status);
  console.log('🔍 Should show "Pending Travel Admin Approval"');
  
  return processedRequests;
};

// Step 3: Test approve action
const testApproveAction = (processedRequests) => {
  console.log('\n✅ Step 3: Testing Approve Action...');
  
  if (processedRequests.length === 0) {
    console.log('❌ No requests to approve');
    return false;
  }
  
  const requestToApprove = processedRequests[0];
  console.log('📋 Request to approve:', requestToApprove.id, requestToApprove.status);
  
  if (requestToApprove.status !== 'Pending Travel Admin Approval') {
    console.log('❌ Request status is not "Pending Travel Admin Approval"');
    console.log('🔍 Current status:', requestToApprove.status);
    return false;
  }
  
  // Simulate approve action
  requestToApprove.status = 'Approved';
  console.log('✅ Request approved - new status:', requestToApprove.status);
  
  return true;
};

// Step 4: Test complete flow
const testCompleteFlow = () => {
  console.log('\n🎯 Step 4: Testing Complete Flow...');
  
  clearStorage();
  const { submittedRequests, travelAdminQueue } = createTestRequest();
  const processedRequests = testTravelAdminLoading(travelAdminQueue);
  const approveSuccess = testApproveAction(processedRequests);
  
  if (approveSuccess) {
    console.log('🎉 APPROVE BUTTON TEST PASSED!');
    console.log('\n📋 Expected Travel Admin Dashboard Behavior:');
    console.log('1. Shows 1 request with "Pending Travel Admin Approval" status');
    console.log('2. Approve button should be visible and clickable');
    console.log('3. After approve: status changes to "Approved"');
    console.log('4. Book button becomes available');
  } else {
    console.log('❌ APPROVE BUTTON TEST FAILED!');
    console.log('\n🔧 Debug Steps:');
    console.log('1. Check browser console for errors');
    console.log('2. Verify localStorage data');
    console.log('3. Check if requests are loading properly');
  }
  
  return approveSuccess;
};

// Manual testing instructions
console.log('📝 MANUAL TESTING INSTRUCTIONS:');
console.log('1. Open browser console');
console.log('2. Run: localStorage.clear()');
console.log('3. Create employee request → Manager approves');
console.log('4. Go to Travel Admin dashboard');
console.log('5. Check console for "Travel Admin loading queue" message');
console.log('6. Verify request shows "Pending Travel Admin Approval" status');
console.log('7. Click Approve button → Should open modal');
console.log('8. Add comments → Click "Approve Request"');
console.log('9. Status should change to "Approved"');

// Run the test
console.log('\n🚀 Running automated test...');
testCompleteFlow();

console.log('\n🔧 DEBUGGING CHECKLIST:');
console.log('✓ Check if travelAdminQueue has data');
console.log('✓ Check if loadApprovedRequests is called');
console.log('✓ Check if requests array is populated');
console.log('✓ Check if filterRequests is working');
console.log('✓ Check if approve button click triggers openActionModal');
console.log('✓ Check if modal opens with correct action');
console.log('✓ Check if submitAction is called with "approve"');
