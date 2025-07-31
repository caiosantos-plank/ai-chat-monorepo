"use client";

import { useState } from "react";
import type { Message } from "@/shared/types/entities";
import { sendMessage } from "../actions";
import ChatWindow from "./chat-window";

export default function ChatWrapper() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSendMessage = async (content: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            content,
            role: "user",
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        const { message: response } = await sendMessage(content);

        const aiMessage: Message = {
            id: response.kwargs.response_metadata.id ?? "",
            content: response.kwargs.content.toString(),
            role: "assistant",
            timestamp: new Date(),
        };
        setLoading(false);
        setMessages(prev => [...prev, aiMessage]);
    };

    return (
        <div className="h-[calc(100vh-4rem)]">
            <ChatWindow
                messages={messages}
                onSendMessage={handleSendMessage}
                loading={loading}
            />
        </div>
    )
}