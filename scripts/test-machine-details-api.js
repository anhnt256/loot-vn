const fetch = require('node-fetch');

// Test script for machine details API
async function testMachineDetailsAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing Machine Details API...\n');

  try {
    // Test 1: Get all machine groups
    console.log('1. Testing GET /api/machine-groups');
    const groupsResponse = await fetch(`${baseUrl}/api/machine-groups`);
    const groupsResult = await groupsResponse.json();
    
    if (groupsResult.success) {
      console.log('✅ Machine groups fetched successfully');
      console.log(`Found ${groupsResult.data.length} machine groups:`);
      groupsResult.data.forEach(group => {
        console.log(`  - ${group.MachineGroupName} (ID: ${group.MachineGroupId}, Machines: ${group.machineCount}, Price: ${group.PriceDefault})`);
      });
    } else {
      console.log('❌ Failed to fetch machine groups:', groupsResult.error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Get all machine details
    console.log('2. Testing GET /api/machine-details');
    const detailsResponse = await fetch(`${baseUrl}/api/machine-details`);
    const detailsResult = await detailsResponse.json();
    
    if (detailsResult.success) {
      console.log('✅ Machine details fetched successfully');
      console.log(`Found ${detailsResult.data.length} machines:`);
      
      // Group by machine group
      const groupedMachines = detailsResult.data.reduce((acc, machine) => {
        const groupName = machine.machineGroupName;
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(machine);
        return acc;
      }, {});

      Object.keys(groupedMachines).forEach(groupName => {
        console.log(`\n  ${groupName}:`);
        groupedMachines[groupName].forEach(machine => {
          console.log(`    - ${machine.machineName} (Price: ${machine.price} VNĐ)`);
          if (machine.netInfo) {
            const specs = machine.netInfo;
            console.log(`      CPU: ${specs.Cpu || 'Unknown'}`);
            console.log(`      GPU: ${specs.Gpu || 'Unknown'}`);
            console.log(`      Memory: ${specs.Memory || 'Unknown'}`);
            if (specs.cpu_load) console.log(`      CPU Load: ${specs.cpu_load}%`);
            if (specs.gpu_load) console.log(`      GPU Load: ${specs.gpu_load}%`);
            if (specs.ram_load) console.log(`      RAM Load: ${specs.ram_load}%`);
          }
        });
      });
    } else {
      console.log('❌ Failed to fetch machine details:', detailsResult.error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Get machine details by specific group
    if (groupsResult.success && groupsResult.data.length > 0) {
      const firstGroupId = groupsResult.data[0].MachineGroupId;
      console.log(`3. Testing GET /api/machine-details/by-group?machineGroupId=${firstGroupId}`);
      
      const groupDetailsResponse = await fetch(`${baseUrl}/api/machine-details/by-group?machineGroupId=${firstGroupId}`);
      const groupDetailsResult = await groupDetailsResponse.json();
      
      if (groupDetailsResult.success) {
        console.log('✅ Machine details by group fetched successfully');
        console.log(`Found ${groupDetailsResult.data.length} machines in group ${firstGroupId}:`);
        groupDetailsResult.data.forEach(machine => {
          console.log(`  - ${machine.machineName} (Price: ${machine.price} VNĐ)`);
        });
      } else {
        console.log('❌ Failed to fetch machine details by group:', groupDetailsResult.error);
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testMachineDetailsAPI();
