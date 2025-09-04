// Debug Travel Request Flow
console.log('🔧 DEBUGGING TRAVEL REQUEST FLOW\n');

// Clear existing data
console.log('🧹 Clearing localStorage...');
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('submittedRequests');
  localStorage.removeItem('travelAdminQueue');
  console.log('✅ localStorage cleared');
} else {
  console.log('⚠️ localStorage not available (running in Node.js)');
}

// Simulate the flow step by step
console.log('\n📝 Step 1: Employee creates request');
const employeeRequest = {
  projectName: 'Debug Test Project',
  departmentName: 'Engineering',
  reasonForTravelling: 'Debug test',
  typeOfBooking: 'Flight',
  status: 'Pending',
  employeeId: 'E001',
  submittedDate: new Date().toISOString()
};

// Simulate submittedRequests
let submittedRequests = [employeeRequest];
console.log('✅ Employee request created:', employeeRequest.projectName);

console.log('\n👔 Step 2: Manager approves request');
submittedRequests[0].status = 'Approved';
submittedRequests[0].managerComments = 'Debug test approval';
submittedRequests[0].approvedDate = new Date().toISOString();

// Manager moves to travel admin queue WITH travelAdminStatus
const travelAdminQueue = [{
  ...submittedRequests[0],
  travelAdminStatus: 'Pending Travel Admin Approval'  // This is the key fix!
}];

console.log('✅ Manager approved and moved to travel admin queue');
console.log('📋 Travel Admin Queue:', travelAdminQueue);
console.log('🔍 Travel Admin Status:', travelAdminQueue[0].travelAdminStatus);

console.log('\n✈️ Step 3: Travel Admin Dashboard should show:');
console.log('- Dashboard: 1 request with "Pending Travel Admin Approval" status');
console.log('- Request Management: Same request');
console.log('- Booking History: Empty (no completed requests yet)');

console.log('\n🎯 Expected Travel Admin Actions:');
console.log('1. Approve → Status becomes "Approved"');
console.log('2. Book → Status becomes "Booked"');  
console.log('3. Complete → Status becomes "Completed" → Shows in Booking History');

console.log('\n🔧 DEBUG COMPLETE - Check browser console for actual localStorage data');

// Instructions for manual debugging
console.log('\n📋 MANUAL DEBUG STEPS:');
console.log('1. Open browser console');
console.log('2. Run: localStorage.clear()');
console.log('3. Create employee request');
console.log('4. Check: console.log(JSON.parse(localStorage.getItem("submittedRequests")))');
console.log('5. Manager approves');
console.log('6. Check: console.log(JSON.parse(localStorage.getItem("travelAdminQueue")))');
console.log('7. Go to Travel Admin dashboard');
console.log('8. Check console for "Travel Admin loading queue" message');
