const { exec } = require('child_process');

const port = process.env.PORT || 5000;

console.log(`🔍 Checking for processes on port ${port}...`);

exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
  if (error) {
    console.log(`✅ No processes found on port ${port}`);
    process.exit(0);
  }

  const lines = stdout.trim().split('\n');
  const pids = new Set();
  
  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 5) {
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        pids.add(pid);
      }
    }
  });

  if (pids.size === 0) {
    console.log(`✅ No processes found on port ${port}`);
    process.exit(0);
  }

  console.log(`🔫 Found ${pids.size} process(es) on port ${port}: ${Array.from(pids).join(', ')}`);
  
  // Kill all processes
  let killedCount = 0;
  const totalPids = pids.size;
  
  pids.forEach(pid => {
    exec(`taskkill /PID ${pid} /F`, (killError) => {
      if (killError) {
        console.log(`❌ Failed to kill process ${pid}: ${killError.message}`);
      } else {
        console.log(`✅ Successfully killed process ${pid}`);
        killedCount++;
      }
      
      if (killedCount === totalPids) {
        console.log(`🎉 Cleared port ${port}! You can now start your server.`);
        process.exit(0);
      }
    });
  });
});
