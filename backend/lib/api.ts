export type MessageStatus = 'QUEUED' | 'ACCEPTED' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface Message {
    id: string;
    to: string;
    body: string;
    status: MessageStatus;
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 8080}/api`;

export async function getNextMessage(): Promise<Message | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/messages/next_message`);
        if (response.status === 404) {
            return null;
        }
        if (!response.ok) {
            throw new Error(`Failed to fetch next message: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching next message:', error);
        return null;
    }
}

export async function updateMessageStatus(messageId: string, status: MessageStatus): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/messages/${messageId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            throw new Error(`Failed to update message status: ${response.statusText}`);
        }

        console.log(`\t- Message ${messageId} status updated to ${status}`);

        return true;
    } catch (error) {
        console.error('Error updating message status:', error);
        return false;
    }
}