"use client";

import { useState, useEffect, FormEvent } from "react";
import { getMessages, createMessage, type Message } from "@/lib/api";

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newMessage = await createMessage({
        to: phoneNumber,
        body: messageBody,
      });
      setMessages([newMessage, ...messages]);
      setPhoneNumber("");
      setMessageBody("");
    } catch (error) {
      console.error("Error scheduling message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPhoneNumber("");
    setMessageBody("");
  };

  return (
    <div>
      <main>
        <div>
          <div>
            Schedule New Message
          </div>
          <form onSubmit={handleSubmit} onReset={handleReset}>
            <div>
              <label htmlFor="phoneNumber">
                Phone Number:
              </label>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="message">
                Message:
              </label>
              <textarea
                id="message"
                placeholder="Enter your message here..."
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                required
                rows={4}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Scheduling..." : "Schedule Message"}
            </button>
            <button
              type="reset"
              disabled={isLoading}
            >
              Clear
            </button>
          </form>
        </div>

        <div>
          <div>
            <span>Scheduled Messages</span>
            <span>({messages.length})</span>
          </div>
          <div>
            {messages.map((message) => (
              <div
                key={message.id}
              >
                <span>{message.to}</span>
                <span>
                  {message.status}
                </span>
                <p>{message.body}</p>
                <p>
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            {messages.length === 0 && (
              <div>
                No scheduled messages yet
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}