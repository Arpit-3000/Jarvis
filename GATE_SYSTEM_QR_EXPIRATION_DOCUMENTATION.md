# 🚪 Gate System QR Expiration Documentation

## Overview
This documentation explains the QR code expiration system for the Gate In-Out system. The system automatically handles QR code expiration after 5 minutes and allows students to regenerate QR codes without conflicts.

## 🔧 Backend Changes Made

### 1. Automatic Cleanup in generatePass Function
```javascript
// File: controllers/gateController.js
const cleanupExpiredPendingLogs = async (studentId) => {
  try {
    const now = new Date();
    const result = await GateLog.deleteMany({
      studentId: studentId,
      status: 'pending',
      expiresAt: { $lt: now }
    });
    
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} expired pending gate logs for student ${studentId}`);
    }
    
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired pending logs:', error);
    return 0;
  }
};
```

### 2. Enhanced scanPass Function
```javascript
// File: controllers/gateController.js
exports.scanPass = async (req, res) => {
  try {
    const { token, remarks } = req.body;
    const guard = req.staff;

    // Handle case where token might be sent as remarks (frontend issue)
    let actualToken = token;
    let actualRemarks = remarks;
    
    // If token is not provided but remarks looks like a JWT token, swap them
    if (!token && remarks && remarks.length > 100 && remarks.includes('.')) {
      actualToken = remarks;
      actualRemarks = '';
    }

    if (!actualToken) {
      return sendError(res, 400, 'QR token is required');
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(actualToken, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return sendError(res, 400, 'QR pass has expired. Please generate a new one.');
      }
      return sendError(res, 400, 'Invalid QR pass');
    }

    // Find the gate log
    const gateLog = await GateLog.findOne({ qrToken: actualToken });
    if (!gateLog) {
      return sendError(res, 404, 'Gate pass not found');
    }

    // Check if already processed
    if (gateLog.status === 'processed') {
      return sendError(res, 400, 'This gate pass has already been used');
    }

    // Check if expired
    if (gateLog.expiresAt < new Date()) {
      // Delete expired pending entries to allow regeneration
      if (gateLog.status === 'pending') {
        await GateLog.findByIdAndDelete(gateLog._id);
        return sendError(res, 400, 'Gate pass has expired. Please generate a new one.');
      } else {
        gateLog.status = 'expired';
        await gateLog.save();
        return sendError(res, 400, 'Gate pass has expired');
      }
    }

    // Process the gate pass
    gateLog.status = 'processed';
    gateLog.scannedBy = guard._id;
    gateLog.scannedAt = new Date();
    if (actualRemarks && actualRemarks.trim().length > 0) {
      gateLog.remarks = actualRemarks.trim();
    }
    await gateLog.save();

    // Update student status
    student.currentStatus = gateLog.action === 'exit' ? 'out' : 'in';
    student.lastGateLog = gateLog._id;
    await student.save();

    sendSuccess(res, 200, 'Gate pass processed successfully', {
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        studentId: student.studentId,
        department: student.department,
        year: student.year,
        phone: student.phone,
        currentStatus: student.currentStatus
      },
      gateLog: {
        id: gateLog._id,
        action: gateLog.action,
        destination: gateLog.destination,
        processedAt: gateLog.scannedAt,
        processedBy: guard.name,
        remarks: gateLog.remarks
      }
    });

  } catch (error) {
    console.error('Scan pass error:', error);
    sendError(res, 500, 'Server error while processing gate pass');
  }
};
```

### 3. Global Cleanup Function
```javascript
// File: controllers/gateController.js
exports.cleanupAllExpiredPendingLogs = async () => {
  try {
    const now = new Date();
    const result = await GateLog.deleteMany({
      status: 'pending',
      expiresAt: { $lt: now }
    });
    
    if (result.deletedCount > 0) {
      console.log(`Global cleanup: Removed ${result.deletedCount} expired pending gate logs`);
    }
    
    return result.deletedCount;
  } catch (error) {
    console.error('Error in global cleanup of expired pending logs:', error);
    return 0;
  }
};
```

### 4. Scheduled Cleanup Job
```javascript
// File: utils/cleanupScheduler.js
const cron = require('node-cron');
const gateController = require('../controllers/gateController');

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
```

### 5. Server Integration
```javascript
// File: server.js
const { startCleanupScheduler } = require('./utils/cleanupScheduler');

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  
  // Start the cleanup scheduler
  startCleanupScheduler();
});
```

## 🎨 Frontend Changes Required

### 1. Fix QR Scanning API Call
```javascript
// ❌ WRONG - Current implementation
const scanQRCode = async (qrToken) => {
  const response = await fetch('/api/gate/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guardToken}`
    },
    body: JSON.stringify({
      remarks: qrToken  // ❌ This is wrong!
    })
  });
};

// ✅ CORRECT - Updated implementation
const scanQRCode = async (qrToken) => {
  const response = await fetch('/api/gate/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guardToken}`
    },
    body: JSON.stringify({
      token: qrToken,    // ✅ Send token here
      remarks: ''        // ✅ Optional remarks here
    })
  });
};
```

### 2. QR Generation with Expiration Handling
```javascript
const generateGatePass = async (destination) => {
  try {
    const response = await fetch('/api/gate/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ destination })
    });

    const data = await response.json();
    
    if (data.success) {
      // Store expiration time
      const expiresAt = new Date(data.data.expiresAt);
      
      // Set up auto-refresh timer
      const timeUntilExpiry = expiresAt.getTime() - Date.now();
      setTimeout(() => {
        // Auto-refresh QR when expired
        handleQRExpired();
      }, timeUntilExpiry);
      
      return data.data;
    } else {
      // Handle specific error cases
      if (data.message.includes('already have an active gate pass')) {
        showMessage('You already have an active gate pass. Please use it or wait for it to expire.');
      }
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('QR generation error:', error);
    throw error;
  }
};
```

### 3. QR Expiration Timer Component
```javascript
import React, { useState, useEffect } from 'react';

const QRExpirationTimer = ({ expiresAt, onExpired }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!expiresAt) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const minutes = Math.floor(difference / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('Expired');
        onExpired();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpired]);

  return (
    <div className="qr-timer">
      <span className={timeLeft === 'Expired' ? 'expired' : 'active'}>
        {timeLeft === 'Expired' ? 'QR Expired' : `Expires in: ${timeLeft}`}
      </span>
    </div>
  );
};

export default QRExpirationTimer;
```

### 4. Complete Gate Pass Generator Component
```javascript
import React, { useState } from 'react';
import QRExpirationTimer from './QRExpirationTimer';

const GatePassGenerator = () => {
  const [qrCode, setQRCode] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [destination, setDestination] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastDestination, setLastDestination] = useState('');

  const generateGatePass = async (destination) => {
    try {
      const response = await fetch('/api/gate/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
        },
        body: JSON.stringify({ destination })
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        if (data.message.includes('already have an active gate pass')) {
          alert('आपका पहले से ही एक active gate pass है। पहले उसे use करें या expire होने का wait करें।');
        }
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('QR generation error:', error);
      throw error;
    }
  };

  const handleGenerateQR = async () => {
    if (!destination.trim()) {
      alert('Please enter destination');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateGatePass(destination.trim());
      setQRCode(result.qrCode);
      setExpiresAt(result.expiresAt);
      setLastDestination(destination.trim());
    } catch (error) {
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQRExpired = () => {
    setQRCode(null);
    setExpiresAt(null);
    alert('QR code expired! Generate a new one.');
  };

  return (
    <div className="gate-pass-generator">
      <div className="destination-input">
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Enter destination (e.g., Library, Canteen)"
          disabled={isGenerating}
        />
        <button 
          onClick={handleGenerateQR}
          disabled={isGenerating || !destination.trim()}
        >
          {isGenerating ? 'Generating...' : 'Generate QR'}
        </button>
      </div>

      {qrCode && (
        <div className="qr-display">
          <img src={qrCode} alt="Gate Pass QR Code" />
          <QRExpirationTimer 
            expiresAt={expiresAt} 
            onExpired={handleQRExpired}
          />
          <p>Show this QR code to the guard at the gate</p>
        </div>
      )}
    </div>
  );
};

export default GatePassGenerator;
```

### 5. CSS Styling
```css
.qr-timer {
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
}

.qr-timer .active {
  color: #28a745;
  font-weight: bold;
}

.qr-timer .expired {
  color: #dc3545;
  font-weight: bold;
}

.qr-display {
  text-align: center;
  margin-top: 20px;
}

.qr-display img {
  max-width: 300px;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.destination-input {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.destination-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.destination-input button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.destination-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
```

## 🔄 System Flow

### 1. QR Generation Flow
```
Student Request → Check for existing pending → Clean expired entries → Generate new QR → Return QR with 5min expiry
```

### 2. QR Expiration Flow
```
QR Generated → 5 minutes pass → QR expires → Entry deleted from database → Student can generate new QR
```

### 3. QR Scanning Flow
```
Guard scans QR → Verify token → Check if expired → If expired, delete entry → Allow new QR generation
```

## 🛠️ Configuration

### Environment Variables
```env
QR_EXPIRE_MINUTES=5  # QR code validity in minutes
JWT_SECRET=your_jwt_secret
```

### Database Schema Updates
```javascript
// GateLog model already supports expiration
{
  studentId: ObjectId,
  status: 'pending' | 'processed' | 'expired',
  expiresAt: Date,  // When QR expires
  qrToken: String,  // JWT token
  // ... other fields
}
```

## 🚨 Error Handling

### Common Error Scenarios
1. **QR Expired**: "Gate pass has expired. Please generate a new one."
2. **Already Active Pass**: "You already have an active gate pass. Please use that or wait until it expires."
3. **Invalid Token**: "Invalid QR pass"
4. **Already Used**: "This gate pass has already been used"

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": "Additional error details"
}
```

## 📊 Monitoring and Logs

### Cleanup Logs
```
Cleaned up 1 expired pending gate logs for student 68c1ddeadbb11ff6d1554b06
Scheduled cleanup completed: Removed 3 expired pending gate logs
```

### Performance Metrics
- **Cleanup Frequency**: Every 5 minutes
- **QR Validity**: 5 minutes
- **Auto-cleanup**: On every QR generation
- **Manual cleanup**: On QR scanning

## 🧪 Testing

### Test Scenarios
1. **Generate QR** → Should work immediately
2. **Wait 5 minutes** → QR should expire
3. **Generate new QR** → Should work without "already active" error
4. **Scan expired QR** → Should delete entry and allow new generation
5. **Scheduled cleanup** → Should run every 5 minutes

### Test Commands
```bash
# Test QR generation
curl -X POST http://localhost:5000/api/gate/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <student_token>" \
  -d '{"destination": "Library"}'

# Test QR scanning
curl -X POST http://localhost:5000/api/gate/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <guard_token>" \
  -d '{"token": "<qr_token>", "remarks": ""}'
```

## 🎯 Benefits

1. **No More Conflicts**: Students can generate new QR after expiration
2. **Automatic Cleanup**: Expired entries are automatically removed
3. **Better UX**: Clear expiration timer and error messages
4. **Database Efficiency**: No accumulation of expired entries
5. **Scheduled Maintenance**: Regular cleanup ensures system health

## 🔧 Maintenance

### Regular Tasks
- Monitor cleanup logs
- Check for any stuck entries
- Verify scheduled job is running
- Monitor database size

### Troubleshooting
- If cleanup stops working, restart the server
- Check MongoDB connection
- Verify cron job is running
- Check server logs for errors

---

**Note**: This system ensures that students can always generate new QR codes after expiration, eliminating the "already have active pass" error while maintaining data integrity.
