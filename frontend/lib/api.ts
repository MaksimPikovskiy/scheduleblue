export interface Message {
  id: string;
  to: string;
  body: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageRequest {
  to: string;
  body: string;
}

export interface ApiError {
  error: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Fetch all messages
export async function getMessages(): Promise<Message[]> {
  const response = await fetch(`${API_URL}/messages`);
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  return response.json();
}

// Create a new message
export async function createMessage(data: CreateMessageRequest): Promise<Message> {
  const response = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || "Failed to schedule message");
  }

  return response.json();
}

