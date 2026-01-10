import { spawn } from 'child_process';
import path from 'path';
import { getNextMessage, MessageStatus, updateMessageStatus } from '../lib/api';
import { sleep } from '../lib/utils';

const MESSAGES_PER_HOUR = parseInt(process.env.MESSAGES_PER_HOUR || '1', 10);
const INTERVAL_MS = (60 * 60 * 1000) / MESSAGES_PER_HOUR;
const ACCEPTED_STATUS_PERMANENCE_MS = parseInt(process.env.ACCEPTED_STATUS_PERMANENCE_MS || '5000', 10);

interface GatewayResponse {
  status: MessageStatus;
  error?: string;
}

async function callGateway(messageId: string, to: string, body: string): Promise<GatewayResponse> {
  return new Promise((resolve, _) => {
    // Spawn the gateway process
    const gatewayPath = path.join(__dirname, '../../gateway/send-message.js');
    const gatewayProcess = spawn('node', [gatewayPath, messageId, to, body]);

    let stdout = '';
    let stderr = '';

    // Capture stdout and stderr
    gatewayProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    gatewayProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle process exit
    gatewayProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (error) {
          console.error('Failed to parse gateway response:', error);
          resolve({ status: 'FAILED', error: 'Invalid gateway response' });
        }
      } else {
        console.error(`Gateway process exited with code ${code}:`, stderr);
        resolve({ status: 'FAILED', error: stderr || 'Gateway process failed' });
      }
    });

    // Handle process errors
    gatewayProcess.on('error', (error) => {
      console.error('Gateway process error:', error);
      resolve({ status: 'FAILED', error: error.message });
    });
  });
}

async function processNextMessage() {
  try {
    const message = await getNextMessage();

    if (!message) {
      console.log('No queued messages to process');
      return;
    }

    console.log(`Processing message ${message.id} to ${message.to}`);

    // Update status to ACCEPTED
    const accepted = await updateMessageStatus(message.id, 'ACCEPTED');
    if (!accepted) {
      console.error(`Failed to update message ${message.id} to ACCEPTED`);
      return;
    }

    // Wait for the configured waiting duration
    await sleep(ACCEPTED_STATUS_PERMANENCE_MS);

    // Call the gateway to send the message
    const result = await callGateway(message.id, message.to, message.body);

    // Update message status based on gateway response
    const updatedStatus = await updateMessageStatus(message.id, result.status);
    if (!updatedStatus) {
      console.error(`Failed to update message ${message.id} to ${result.status}`);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
}

export function startQueueProcessor() {
  console.log(`Queue processor started. Processing ${MESSAGES_PER_HOUR} message(s) per hour.`);
  console.log(`Interval: ${INTERVAL_MS / 1000} seconds`);

  // Immediately process the next message on start
  processNextMessage();

  // Set interval to process messages
  setInterval(processNextMessage, INTERVAL_MS);
}

