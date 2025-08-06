"use client";

import { useState } from "react";
import type { Message } from "@/shared/types/entities";
import ChatWindow from "./chat-window";
import { sendMessage } from "../actions.client";
import { clearChatHistory } from "../actions.server";

interface ChatWrapperProps {
    chatId: string;
    history: Message[];
}

export default function ChatWrapper({ chatId, history }: ChatWrapperProps) {
    const [messages, setMessages] = useState<Message[]>(history);
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

        const { message: response } = await sendMessage(chatId, content);

        const aiMessage: Message = {
            id: Date.now().toString(),
            content: response.content.toString(),
            role: "assistant",
            timestamp: new Date(),
        };
        setLoading(false);
        setMessages(prev => [...prev, aiMessage]);
    };

    const handleClearChatHistory = async () => {
        await clearChatHistory(chatId);
    };

    return (
        <div className="h-[calc(100vh-4rem)]">
            <ChatWindow
                messages={messages}
                onSendMessage={handleSendMessage}
                loading={loading}
                onClearChatHistory={handleClearChatHistory}
            />
        </div>
    )
}