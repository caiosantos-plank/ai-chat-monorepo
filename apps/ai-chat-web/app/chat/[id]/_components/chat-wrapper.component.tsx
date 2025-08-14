"use client";

import { useChat } from '@ai-sdk/react'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sendAudioMessage, sendMessage } from '../actions.client';
import { clearChatHistory } from "../actions.server";
import ChatWindow from "./chat-window.component";
import type { Message } from "@/shared/types/entities";
import { parseStreamMessageToMessage } from "@/shared/utils";
import { v4 } from 'uuid';

interface ChatWrapperProps {
    chatId: string;
    history: Message[];
}

export default function ChatWrapper({ chatId, history }: ChatWrapperProps) {
    const router = useRouter();
    const [parsedMessages, setParsedMessages] = useState<Message[]>(history);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const { input, messages, handleInputChange, setInput, setMessages } = useChat({
        streamProtocol: "text",
        id: chatId,
        api: `/api/chat/${chatId}`,
        initialMessages: history,
    });

    useEffect(() => {
        setParsedMessages(messages.map(parseStreamMessageToMessage));
    }, [messages]);

    const cleanMessagesWithErrors = () => {
        setMessages((prevMessages) => prevMessages.slice(0, -1));
        setHasError(false);
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (hasError) {
            cleanMessagesWithErrors();
        }

        const userMessage = {
            id: v4(),
            role: "user",
            content: input,
        } as Message;

        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");

        const data = await sendMessage(chatId, [userMessage]);

        if (data) {
            setMessages((prevMessages) => [...prevMessages, data]);
        } else {
            setHasError(true);
        }
        setIsLoading(false);
    };

    const handleSendAudioMessage = async (e: React.FormEvent, audioRecording: Blob) => {
        e.preventDefault();
        setIsLoading(true);

        if (hasError) {
            cleanMessagesWithErrors();
        }

        const data = await sendAudioMessage(chatId, audioRecording, messages);
        if (data.length > 0) {
            setMessages((prevMessages) => [...prevMessages, ...data]);
        }

        setIsLoading(false);
    }

    const handleRetryMessage = async (message: Message) => {
        setIsLoading(true);
        setHasError(false);
        const data = await sendMessage(chatId, [message]);


        if (data) {
            setMessages((prevMessages) => [...prevMessages, data]);
        } else {
            setHasError(true);
        }
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
                input={input}
                messages={parsedMessages}
                loading={isLoading}
                hasError={hasError}
                onInputChange={handleInputChange}
                onSendMessage={handleSendMessage}
                onSendAudioMessage={handleSendAudioMessage}
                onClearChatHistory={handleClearChatHistory}
                retryMessage={handleRetryMessage}
            />
        </div>
    )
}