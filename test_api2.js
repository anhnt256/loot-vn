fetch('http://127.0.0.1:3000/api/computer?prefix=MAY', {
  headers: {
    'x-tenant-id': 'anhnt256'
  }
}).then(r => r.json()).then(d => {
  const may03 = d.data ? d.data.find(c => c.name === 'MAY03') : d.find(c => c.name === 'MAY03');
  console.log(JSON.stringify(may03, null, 2));
}).catch(console.error);
