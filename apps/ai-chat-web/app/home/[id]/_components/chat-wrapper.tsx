"use client";

import { useChat } from '@ai-sdk/react'
import { useEffect, useState } from "react";
import type { Message } from "@/shared/types/entities";
import { parseStreamMessageToMessage } from "@/shared/utils";
import { clearChatHistory } from "../actions.server";
import ChatWindow from "./chat-window";

interface ChatWrapperProps {
    chatId: string;
    history: Message[];
}

export default function ChatWrapper({ chatId, history }: ChatWrapperProps) {
    const [parsedMessages, setParsedMessages] = useState<Message[]>(history);

    const { input, messages, handleSubmit, handleInputChange, isLoading } = useChat({
        streamProtocol: "text",
        id: chatId,
        api: `/api/chat/${chatId}`,
        initialMessages: history,
    });

    useEffect(() => {
        console.log("messages", messages.at(-1));
        setParsedMessages(messages.map(parseStreamMessageToMessage));
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(e);
    };

    const handleClearChatHistory = async () => {
        await clearChatHistory(chatId);
    };

    return (
        <div className="h-[calc(100vh-4rem)]">
            <ChatWindow
                messages={parsedMessages}
                input={input}
                onInputChange={handleInputChange}
                onSendMessage={handleSendMessage}
                loading={isLoading}
                onClearChatHistory={handleClearChatHistory}
            />
        </div>
    )
}