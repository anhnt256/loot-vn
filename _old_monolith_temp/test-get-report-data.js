const http = require('http');

async function testGetReportData() {
  try {
    const url = 'http://localhost:3000/api/handover-reports/get-report-data?date=2025-08-02&reportType=BAO_CAO_BEP';
    
    console.log('Testing API with:', {
      date: '2025-08-02',
      reportType: 'BAO_CAO_BEP'
    });
    
    const response = await new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(JSON.parse(data));
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
    
    const data = response;
    
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\nMaterials count:', data.data.materials.length);
      console.log('Staff info:', data.data.staffInfo);
      console.log('Submission tracking:', data.data.submissionTracking);
      
      if (data.data.materials.length > 0) {
        console.log('\nFirst material:', data.data.materials[0]);
      }
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testGetReportData(); 