"use client";

import { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import { getMessages, createMessage, type Message } from "@/lib/api";
import { getStatusColor } from "@/lib/utils";
import { WindowTitleBar } from "@/components/ui/window-title-bar";

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
      toast.error("Failed to load messages");
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
      toast.success("Message scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling message:", error);
      toast.error(error instanceof Error ? error.message : "Failed to schedule message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPhoneNumber("");
    setMessageBody("");
  };

  return (
    <div className="app-container">
      <div className="main-wrapper">
        <main className="main-content">
          <WindowTitleBar title="ScheduleBlue - Message Scheduler" link="/dashboard" linkText="Dashboard" isNext={true} />

          <div className="window-content window-content-flex">
            <div className="panel panel-half">
              <div className="panel-header">
                Schedule New Message
              </div>
              <form className="form-container" onSubmit={handleSubmit} onReset={handleReset}>
                <div className="form-group">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number:
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Message:
                  </label>
                  <textarea
                    id="message"
                    placeholder="Enter your message here..."
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    required
                    rows={4}
                    className="form-textarea"
                  />
                </div>
                <div className="btn-group">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn"
                  >
                    {isLoading ? "Scheduling..." : "Schedule Message"}
                  </button>
                  <button
                    type="reset"
                    disabled={isLoading}
                    className="btn"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            <div className="panel panel-half">
              <div className="panel-header panel-header-flex">
                <span>Scheduled Messages</span>
                <span>({messages.length})</span>
              </div>
              <div className="messages-list">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="message-card"
                  >
                    <div className="message-header">
                      <span className="message-phone">{message.to}</span>
                      <span className={`status-badge ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                    </div>
                    <p className="message-body">{message.body}</p>
                    <p className="message-footer">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center text-empty text-italic">
                    No scheduled messages yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}