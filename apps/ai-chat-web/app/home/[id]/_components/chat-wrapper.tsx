"use client";

import { useChat } from '@ai-sdk/react'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sendAudioMessage, sendMessage } from '../actions.client';
import { clearChatHistory } from "../actions.server";
import ChatWindow from "./chat-window";
import type { Message } from "@/shared/types/entities";
import { parseStreamMessageToMessage } from "@/shared/utils";

interface ChatWrapperProps {
    chatId: string;
    history: Message[];
}

export default function ChatWrapper({ chatId, history }: ChatWrapperProps) {
    const router = useRouter();
    const [parsedMessages, setParsedMessages] = useState<Message[]>(history);
    const [isLoading, setIsLoading] = useState(false);

    const { input, messages, handleInputChange, setInput, setMessages } = useChat({
        streamProtocol: "text",
        id: chatId,
        api: `/api/chat/${chatId}`,
        initialMessages: history,
    });

    useEffect(() => {
        setParsedMessages(messages.map(parseStreamMessageToMessage));
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const userMessage = {
            id: "user-message",
            role: "user",
            content: input,
        } as Message;

        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");

        const data = await sendMessage(chatId, [userMessage]);

        setMessages((prevMessages) => [...prevMessages, data]);
        setIsLoading(false);
    };

    const handleSendAudioMessage = async (e: React.FormEvent, audioRecording: Blob) => {
        e.preventDefault();
        setIsLoading(true);

        const data = await sendAudioMessage(chatId, audioRecording, messages);

        setMessages((prevMessages) => [...prevMessages, ...data]);
        setIsLoading(false);
    }

    const handleClearChatHistory = async () => {
        await clearChatHistory(chatId);

        setMessages([]);
        router.refresh();
    };

    return (
        <div className="h-[calc(100vh-4rem)]">
            <ChatWindow
                messages={parsedMessages}
                input={input}
                onInputChange={handleInputChange}
                onSendMessage={handleSendMessage}
                onSendAudioMessage={handleSendAudioMessage}
                loading={isLoading}
                onClearChatHistory={handleClearChatHistory}
            />
        </div>
    )
}