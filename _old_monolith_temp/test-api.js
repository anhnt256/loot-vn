const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing handover-reports API...');
    
    const response = await fetch('http://localhost:3000/api/handover-reports?date=2025-07-26&reportType=BAO_CAO_BEP', {
      headers: {
        'Cookie': 'branch=GO_VAP'
      }
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI(); 