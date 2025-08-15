"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Message } from "@/shared/types/entities";
import { useChat as useAiChat } from "@ai-sdk/react";
import { parseStreamMessageToMessage } from "@/shared/utils";
import { v4 } from "uuid";
import { sendAudioMessage, sendMessage } from "../actions.client";
import { clearChatHistory } from "../actions.server";

const useChat = (chatId: string, history: Message[]) => {
    const router = useRouter();
    const [parsedMessages, setParsedMessages] = useState<Message[]>(history);
    const [isThinking, setIsThinking] = useState(false);
    const [thinkingMessage, setThinkingMessage] = useState<Message | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const { input, messages, handleInputChange, setInput, setMessages } = useAiChat({
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

    const thinkingMessageCallback = (message: string) => {
        setIsThinking(true);
        setThinkingMessage({
            id: v4(),
            role: "assistant",
            content: message,
            timestamp: new Date(),
        });
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

        const data = await sendMessage(chatId, [userMessage], thinkingMessageCallback);
        setIsThinking(false);

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

        const data = await sendAudioMessage(chatId, audioRecording, messages, thinkingMessageCallback);
        setIsThinking(false);
        if (data.length > 0) {
            setMessages((prevMessages) => [...prevMessages, ...data]);
        }

        setIsLoading(false);
    }

    const handleRetryMessage = async (message: Message) => {
        setIsLoading(true);
        setHasError(false);

        const data = await sendMessage(chatId, [message], (message) => {
            setIsThinking(true);
            setThinkingMessage({
                id: v4(),
                role: "assistant",
                content: message,
                timestamp: new Date(),
            });
        });

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

    return {
        input,
        parsedMessages,
        isLoading,
        isThinking,
        thinkingMessage,
        hasError,
        handleInputChange,
        handleSendMessage,
        handleSendAudioMessage,
        handleRetryMessage,
        handleClearChatHistory,
    }

}

export default useChat;