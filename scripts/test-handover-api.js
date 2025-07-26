const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testHandoverAPI() {
  try {
    console.log('Testing handover reports API...');
    
    // Test without filters
    const response = await fetch('http://localhost:3000/api/handover-reports');
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`Found ${data.data.length} reports`);
      if (data.data.length > 0) {
        console.log('First report:', data.data[0]);
        console.log(`First report has ${data.data[0].materials.length} materials`);
      }
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testHandoverAPI(); 