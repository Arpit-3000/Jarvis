const { spawn, exec } = require('child_process');
const netstat = require('netstat');

// Function to kill process on specific port
function killProcessOnPort(port) {
  return new Promise((resolve, reject) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error) {
        console.log(`No process found on port ${port}`);
        resolve();
        return;
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
        console.log(`No process found on port ${port}`);
        resolve();
        return;
      }

      console.log(`Found processes on port ${port}: ${Array.from(pids).join(', ')}`);
      
      // Kill all processes
      const killPromises = Array.from(pids).map(pid => {
        return new Promise((killResolve, killReject) => {
          exec(`taskkill /PID ${pid} /F`, (killError) => {
            if (killError) {
              console.log(`Failed to kill process ${pid}: ${killError.message}`);
            } else {
              console.log(`Successfully killed process ${pid}`);
            }
            killResolve();
          });
        });
      });

      Promise.all(killPromises).then(() => {
        console.log(`Cleared port ${port}`);
        resolve();
      });
    });
  });
}

// Function to start server
async function startServer() {
  const port = process.env.PORT || 5000;
  
  console.log(`🔍 Checking port ${port}...`);
  
  try {
    await killProcessOnPort(port);
    
    console.log(`🚀 Starting server on port ${port}...`);
    
    // Start the server
    const server = spawn('node', ['server.js'], {
      stdio: 'inherit',
      shell: true
    });

    server.on('error', (error) => {
      console.error('Failed to start server:', error);
    });

    server.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      server.kill('SIGINT');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startServer();
