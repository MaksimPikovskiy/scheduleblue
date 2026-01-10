"use client";

import { PhoneIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getMessages, type Message } from "@/lib/api";
import { getStatusColor } from "@/lib/utils";
import { WindowTitleBar } from "@/components/ui/window-title-bar";
import parsePhoneNumberFromString from "libphonenumber-js";

type FilterType = "all" | "scheduled" | "accepted" | "sent" | "delivered" | "failed";

export default function Dashboard() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [filter, setFilter] = useState<FilterType>("all");
    const [isLoading, setIsLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            const data = await getMessages();
            setMessages(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to load messages");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMessages();

        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredMessages = messages.filter((msg) => {
        switch (filter) {
            case "scheduled":
                return msg.status === "QUEUED";
            case "accepted":
                return msg.status === "ACCEPTED";
            case "sent":
                return msg.status === "SENT";
            case "delivered":
                return msg.status === "DELIVERED";
            case "failed":
                return msg.status === "FAILED";
            default:
                return true;
        }
    });

    const stats = {
        total: messages.length,
        queued: messages.filter((m) => m.status === "QUEUED").length,
        accepted: messages.filter((m) => m.status === "ACCEPTED").length,
        sent: messages.filter((m) => m.status === "SENT").length,
        delivered: messages.filter((m) => m.status === "DELIVERED").length,
        failed: messages.filter((m) => m.status === "FAILED").length,
    };

    return (
        <div className="app-container">
            <div className="main-wrapper">
                <main className="main-content">
                    <WindowTitleBar title="ScheduleBlue - Dashboard" link="/" linkText="Scheduler" isNext={false} />

                    <div className="window-content">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-label">Total Messages</div>
                                <div className="stat-value">{stats.total}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Scheduled</div>
                                <div className="stat-value stat-value-yellow">{stats.queued}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Accepted</div>
                                <div className="stat-value stat-value-yellow">{stats.accepted}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Sent</div>
                                <div className="stat-value stat-value-green">{stats.sent}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Delivered</div>
                                <div className="stat-value stat-value-green">{stats.delivered}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Failed</div>
                                <div className="stat-value stat-value-red">{stats.failed}</div>
                            </div>
                        </div>

                        <div className="filter-buttons">
                            <button
                                onClick={() => setFilter("all")}
                                className={`filter-btn ${filter === "all" ? "active" : "inactive"}`}
                            >
                                All ({stats.total})
                            </button>
                            <button
                                onClick={() => setFilter("scheduled")}
                                className={`filter-btn ${filter === "scheduled" ? "active" : "inactive"}`}
                            >
                                Scheduled ({stats.queued})
                            </button>
                            <button
                                onClick={() => setFilter("accepted")}
                                className={`filter-btn ${filter === "accepted" ? "active" : "inactive"}`}
                            >
                                Accepted ({stats.accepted})
                            </button>
                            <button
                                onClick={() => setFilter("sent")}
                                className={`filter-btn ${filter === "sent" ? "active" : "inactive"}`}
                            >
                                Sent ({stats.sent})
                            </button>
                            <button
                                onClick={() => setFilter("delivered")}
                                className={`filter-btn ${filter === "delivered" ? "active" : "inactive"}`}
                            >
                                Delivered ({stats.delivered})
                            </button>
                            <button
                                onClick={() => setFilter("failed")}
                                className={`filter-btn ${filter === "failed" ? "active" : "inactive"}`}
                            >
                                Failed ({stats.failed})
                            </button>
                        </div>

                        <div className="panel">
                            <div className="panel-header">
                                Messages ({filteredMessages.length})
                            </div>
                            <div className="messages-list-large">
                                {isLoading ? (
                                    <div className="text-center text-empty">Loading...</div>
                                ) : filteredMessages.length === 0 ? (
                                    <div className="text-center text-empty italic">
                                        No messages found
                                    </div>
                                ) : (
                                    filteredMessages.map((message) => {
                                        const phoneNumber = parsePhoneNumberFromString(message.to);

                                        return (
                                            <div
                                                key={message.id}
                                                className="message-card"
                                            >
                                                <div className="message-header">
                                                    <div className="message-phone-with-icon">
                                                        <PhoneIcon className="icon-small" />
                                                        <span className="message-phone">
                                                            {phoneNumber?.formatInternational() || message.to}
                                                        </span>
                                                    </div>
                                                    <span className={`status-badge ${getStatusColor(message.status)}`}>
                                                        {message.status}
                                                    </span>
                                                </div>
                                                <p className="message-body">{message.body}</p>
                                                <div className="message-footer message-footer-flex">
                                                    <span>Scheduled at {new Date(message.createdAt).toLocaleString()}</span>
                                                    <span>Updated at {new Date(message.updatedAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}