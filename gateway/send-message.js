#!/usr/bin/env node

// Get command line arguments
const [messageId, to, body] = process.argv.slice(2);

// Validate required parameters
if (!messageId || !to || !body) {
  console.error(JSON.stringify({
    status: 'FAILED',
    error: 'Missing required parameters: messageId, to, body'
  }));
  process.exit(1);
}

// Simulate sending message
async function sendMessage() {
  try {
    // Simulate random success or failure (85% success rate)
    const success = Math.random() > 0.15;
    
    if (success) {
      // Simulate random status between SENT and DELIVERED
      const status = Math.random() > 0.3 ? 'SENT' : 'DELIVERED';
      
      console.log(JSON.stringify({
        status: status,
        messageId: messageId
      }));
    } else {
      console.log(JSON.stringify({
        status: 'FAILED',
        error: 'Failed to send message (simulated failure)',
        messageId: messageId
      }));
    }
  } catch (error) {
    console.error(JSON.stringify({
      status: 'FAILED',
      error: error.message,
      messageId: messageId
    }));
    process.exit(1);
  }
}

sendMessage();

