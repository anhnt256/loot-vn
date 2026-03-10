const fetch = require('node-fetch');

async function testMaterialsAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing Materials API...\n');
  
  // Test GET materials
  try {
    console.log('1. Testing GET /api/handover-reports/materials?reportType=BAO_CAO_BEP');
    const getResponse = await fetch(`${baseUrl}/api/handover-reports/materials?reportType=BAO_CAO_BEP`, {
      headers: {
        'Cookie': 'branch=GO_VAP'
      }
    });
    const getResult = await getResponse.json();
    console.log('GET Response:', JSON.stringify(getResult, null, 2));
  } catch (error) {
    console.error('GET Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test POST new material
  try {
    console.log('2. Testing POST /api/handover-reports/materials');
    const postResponse = await fetch(`${baseUrl}/api/handover-reports/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'branch=GO_VAP'
      },
      body: JSON.stringify({
        materialName: 'Test Material ' + Date.now(),
        materialType: 'BAO_CAO_BEP',
        isDeleted: false,
        isFood: true
      }),
    });
    const postResult = await postResponse.json();
    console.log('POST Response:', JSON.stringify(postResult, null, 2));
  } catch (error) {
    console.error('POST Error:', error.message);
  }
}

testMaterialsAPI(); 