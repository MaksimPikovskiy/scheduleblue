#!/usr/bin/env node

const [messageId, to, body] = process.argv.slice(2);

if (!messageId || !to || !body) {
  console.error(JSON.stringify({
    status: 'FAILED',
    error: 'Missing required parameters: messageId, to, body'
  }));
  process.exit(1);
}

async function sendMessage() {
  try {
    const success = Math.random() > 0.15;
    
    if (success) {
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

