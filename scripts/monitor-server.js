const http = require('http');

function checkServerHealth() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const healthData = JSON.parse(data);
          resolve({
            status: 'healthy',
            uptime: healthData.uptime,
            timestamp: healthData.timestamp
          });
        } catch (e) {
          resolve({
            status: 'unhealthy',
            error: 'Invalid response format'
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 'unhealthy',
        error: err.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        status: 'unhealthy',
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

function checkPortStatus() {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec('netstat -ano | findstr :5000', (error, stdout) => {
      if (error) {
        resolve({ port: 'not_listening', error: error.message });
      } else if (stdout.trim()) {
        const lines = stdout.trim().split('\n');
        const pids = lines.map(line => {
          const parts = line.trim().split(/\s+/);
          return parts[parts.length - 1];
        }).filter(pid => pid && !isNaN(pid));
        
        resolve({ 
          port: 'listening', 
          pids: pids,
          processCount: pids.length
        });
      } else {
        resolve({ port: 'not_listening', error: 'No process found' });
      }
    });
  });
}

async function monitorServer() {
  console.log('🔍 Server Monitor - Checking Status...\n');
  
  // Check port status
  const portStatus = await checkPortStatus();
  console.log('📡 Port Status:');
  if (portStatus.port === 'listening') {
    console.log(`   ✅ Port 5000 is listening`);
    console.log(`   📊 Process IDs: ${portStatus.pids.join(', ')}`);
    console.log(`   🔢 Process Count: ${portStatus.processCount}`);
  } else {
    console.log(`   ❌ Port 5000 is not listening`);
    console.log(`   🚨 Error: ${portStatus.error}`);
    return;
  }

  // Check server health
  const healthStatus = await checkServerHealth();
  console.log('\n🏥 Server Health:');
  if (healthStatus.status === 'healthy') {
    console.log(`   ✅ Server is healthy`);
    console.log(`   ⏱️  Uptime: ${Math.round(healthStatus.uptime)}s`);
    console.log(`   🕐 Last Check: ${healthStatus.timestamp}`);
  } else {
    console.log(`   ❌ Server is unhealthy`);
    console.log(`   🚨 Error: ${healthStatus.error}`);
  }

  // Test gate routes
  console.log('\n🚪 Gate System Status:');
  try {
    const gateTest = await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/gate/status',
        method: 'GET'
      }, (res) => {
        resolve({
          status: res.statusCode,
          message: res.statusCode === 401 ? 'Protected (Expected)' : `Unexpected: ${res.statusCode}`
        });
      });

      req.on('error', (err) => {
        resolve({ status: 'error', message: err.message });
      });

      req.setTimeout(3000, () => {
        req.destroy();
        resolve({ status: 'timeout', message: 'Request timeout' });
      });

      req.end();
    });

    if (gateTest.status === 401) {
      console.log(`   ✅ Gate routes: ${gateTest.message}`);
    } else {
      console.log(`   ⚠️  Gate routes: ${gateTest.message}`);
    }
  } catch (error) {
    console.log(`   ❌ Gate routes: Error - ${error.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 Summary:');
  console.log(`   Server: ${healthStatus.status === 'healthy' ? '✅ Running' : '❌ Not Running'}`);
  console.log(`   Port: ${portStatus.port === 'listening' ? '✅ Listening' : '❌ Not Listening'}`);
  console.log(`   Gate System: ${healthStatus.status === 'healthy' ? '✅ Ready' : '❌ Not Ready'}`);
  
  if (healthStatus.status === 'healthy') {
    console.log('\n🎉 Your server is running perfectly!');
    console.log('💡 You can now test your gate system with authentication tokens.');
  } else {
    console.log('\n🚨 Server issues detected. Check the logs above for details.');
  }
}

// Run the monitor
monitorServer().catch(console.error);
