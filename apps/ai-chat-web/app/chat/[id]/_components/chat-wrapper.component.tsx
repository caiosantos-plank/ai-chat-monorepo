"use client";

import useChat from "../_hooks/use-chat";
import ChatWindow from "./chat-window.component";
import type { Message } from "@/shared/types/entities";

interface ChatWrapperProps {
    chatId: string;
    history: Message[];
}

export default function ChatWrapper({ chatId, history }: ChatWrapperProps) {
    const {
        input,
        parsedMessages,
        isLoading,
        isThinking,
        thinkingMessage,
        hasError,
        handleInputChange,
        handleSendMessage,
        handleSendAudioMessage,
        handleClearChatHistory,
        handleRetryMessage
    } = useChat(chatId, history);

    return (
        <div className="h-[calc(100vh-4rem)]">
            <ChatWindow
                input={input}
                messages={parsedMessages}
                loading={isLoading}
                isThinking={isThinking}
                thinkingMessage={thinkingMessage}
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