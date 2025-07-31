/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
"use client";

import type { User } from "@supabase/supabase-js";
import { useState, useRef, useEffect } from "react";
import { formatTime } from "@/shared/utils";
import { Button, Input } from "@/shared/components";

interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
    user?: User;
}

interface ChatWindowProps {
    messages?: Message[];
    onSendMessage?: (message: string) => void;
    loading?: boolean;
    user?: User | null;
    className?: string;
}

export default function ChatWindow({
    messages = [],
    onSendMessage,
    loading = false,
    user,
    className = ""
}: ChatWindowProps) {
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && onSendMessage && !loading) {
            onSendMessage(inputValue.trim());
            setInputValue("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };



    const getUserInitials = (name?: string, email?: string) => {
        if (name) {
            return name
                .split(" ")
                .map(n => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        if (email) {
            return email[0].toUpperCase();
        }
        return "U";
    };

    return (
        <div className={`flex flex-col h-full max-w-4xl mx-auto ${className}`}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
                        <p className="text-sm text-muted-foreground">
                            {loading ? "Typing..." : "Online"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">Active</span>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-background/95">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Welcome to AI Chat</h3>
                            <p className="text-muted-foreground mt-1">
                                Start a conversation by typing a message below
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex items-start space-x-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${message.role === "user"
                                    ? "bg-gradient-to-br from-primary to-primary/80"
                                    : "bg-gradient-to-br from-secondary to-secondary/80"
                                    }`}>
                                    {message.role === "user"
                                        ? getUserInitials(user?.user_metadata?.full_name, user?.email)
                                        : "AI"
                                    }
                                </div>

                                {/* Message Content */}
                                <div className={`flex flex-col space-y-1 ${message.role === "user" ? "items-end" : "items-start"
                                    }`}>
                                    <div className={`px-4 py-3 rounded-2xl max-w-full ${message.role === "user"
                                        ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                                        : "bg-card border border-border/50 text-foreground"
                                        }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    </div>
                                    <div className={`flex items-center space-x-2 text-xs text-muted-foreground ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                                        }`}>
                                        <span>{message.role === "user" ? "You" : "AI Assistant"}</span>
                                        <span>•</span>
                                        <span>{formatTime(message.timestamp)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Loading indicator */}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex items-start space-x-3 max-w-[80%]">
                            <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                AI
                            </div>
                            <div className="flex flex-col space-y-1">
                                <div className="px-4 py-3 rounded-2xl bg-card border border-border/50">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                        </div>
                                        <span className="text-sm text-muted-foreground">AI is typing...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm p-4">
                <form onSubmit={handleSubmit} className="flex items-end space-x-3">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Type your message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            className="w-full resize-none border-border/50 focus:border-secondary focus:ring-secondary/20"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={!inputValue.trim() || loading}
                        loading={loading}
                        className="px-6 h-10 bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    >
                        {loading ? "Sending..." : "Send"}
                    </Button>
                </form>

                {/* Input Helpers */}
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    <span>{inputValue.length}/1000</span>
                </div>
            </div>
        </div>
    );
} 