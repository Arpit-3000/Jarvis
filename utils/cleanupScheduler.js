const cron = require('node-cron');
const gateController = require('../controllers/gateController');

/**
 * Scheduled cleanup job for expired pending gate logs
 * Runs every 5 minutes to clean up expired entries
 */
const startCleanupScheduler = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('Running scheduled cleanup of expired pending gate logs...');
      const deletedCount = await gateController.cleanupAllExpiredPendingLogs();
      
      if (deletedCount > 0) {
        console.log(`Scheduled cleanup completed: Removed ${deletedCount} expired pending gate logs`);
      } else {
        console.log('Scheduled cleanup completed: No expired pending gate logs found');
      }
    } catch (error) {
      console.error('Error in scheduled cleanup:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('✅ Gate log cleanup scheduler started - runs every 5 minutes');
};

module.exports = {
  startCleanupScheduler
};
