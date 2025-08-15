/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
"use client";

import type { User } from "@supabase/supabase-js";
import { useRef, useEffect, type ChangeEventHandler } from "react";
import { Button, Input } from "@/shared/components";
import { useAudioRecording } from "@/shared/hooks";
import type { Message } from "@/shared/types/entities";
import { formatTime, getAgentName, getUserInitials } from "@/shared/utils";
import RecordingAudioComponent from "./recording-audio.component";

interface ChatWindowProps {
    input: string;
    loading?: boolean;
    isThinking?: boolean;
    thinkingMessage?: Message | null;
    user?: User | null;
    messages?: Message[];
    className?: string;
    hasError?: boolean;
    onInputChange: ChangeEventHandler<HTMLInputElement>;
    onSendMessage: (event: React.FormEvent) => void;
    onSendAudioMessage: (event: React.FormEvent, audioRecording: Blob) => void;
    retryMessage: (message: Message) => void;
    onClearChatHistory?: () => void;
}

export default function ChatWindow({
    messages = [],
    input,
    loading = false,
    isThinking = false,
    thinkingMessage,
    user,
    className = "",
    hasError = false,
    retryMessage,
    onSendMessage,
    onSendAudioMessage,
    onInputChange,
    onClearChatHistory,
}: ChatWindowProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { isRecording, audioRecording, audioUrl, startRecording, stopRecording, clearAudioRecording } = useAudioRecording();

    const lastMessagePosition = messages.length - 1;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    useEffect(() => {
        if (isRecording) {
            onInputChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
        }

    }, [isRecording, onInputChange]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSendMessage(e);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (audioRecording) {
            onSendAudioMessage(e, audioRecording);
            clearAudioRecording();
        } else {
            onSendMessage(e);
        }
    }

    return (
        <div className={`flex flex-col h-full max-w-4xl mx-auto ${className}`}>
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center">
                        <svg fill="#ffffff" viewBox="-2.09 -2.09 34.08 34.08" xmlSpace="preserve" aria-label="Joker Chat" aria-hidden="true">
                            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <g>
                                    <g>
                                        <path d="M28.405,14.7c-0.479,0-0.897,0.228-1.172,0.576c-1.56-1.127-4.992-2.994-7.975-0.271c0,0-3.021-4.168-0.982-7.569 c0.246,0.178,0.547,0.286,0.875,0.286c0.827,0,1.5-0.671,1.5-1.5s-0.673-1.5-1.5-1.5c-0.828,0-1.502,0.671-1.502,1.5 c0,0.168,0.032,0.327,0.084,0.478c-2.141,0.819-5.836,2.858-6.39,7.307c0,0-3.429-4.541-8.573-1.594 c-0.265-0.425-0.732-0.711-1.27-0.711c-0.829,0-1.501,0.672-1.501,1.5s0.672,1.5,1.501,1.5c0.828,0,1.499-0.672,1.499-1.5 c0-0.047-0.01-0.091-0.014-0.137c1.794,0.14,4.67,1.726,5.461,10.151l0.09,0.688c0,0.707,2.858,1.279,6.382,1.279 c3.526,0,6.383-0.574,6.383-1.279c0,0,0.229-5.78,5.611-7.623c0.041,0.791,0.688,1.423,1.491,1.423c0.83,0,1.5-0.673,1.5-1.5 C29.907,15.371,29.235,14.7,28.405,14.7z"></path>
                                    </g>
                                </g>
                            </g>
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Joker</h2>
                        <p className="text-sm text-muted-foreground">
                            {loading ? "Typing..." : "Online"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={onClearChatHistory}>
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        {" "}History
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-background/95">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Welcome to Joker Chat</h3>
                            <p className="text-muted-foreground mt-1">
                                Start a conversation by typing a message below
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={`${message.id}-${index}`}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex items-start space-x-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${message.role === "user"
                                    ? "bg-gradient-to-br from-primary to-primary/80"
                                    : "bg-gradient-to-br from-secondary to-secondary/80"
                                    }`}>
                                    {message.role === "user"
                                        ? getUserInitials(user?.user_metadata?.full_name, user?.email)
                                        : "JK"
                                    }
                                </div>

                                <div className={`flex flex-col space-y-1 ${message.role === "user" ? "items-end" : "items-start"
                                    }`}>
                                    <div className={`px-4 py-3 rounded-2xl max-w-full ${lastMessagePosition === index && hasError ? "bg-red-500/10 border border-red-500/20" : message.role === "user"
                                        ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                                        : "bg-card border border-border/50 text-foreground"
                                        }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    </div>
                                    <div className={`flex items-center space-x-2 text-xs text-muted-foreground ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                                        }`}>
                                        {message.role === "user" ? "You" : getAgentName(message.agentCalls ?? {}).map((agent, index) => {
                                            return (<div key={`${agent.toLowerCase()}-${index}`}>
                                                <div className="flex items-center space-x-2 border-1 border-background p-1 rounded-md bg-green-400/50">
                                                    <span className="text-xs text-white">
                                                        {agent}
                                                    </span>
                                                </div>
                                            </div>)
                                        })}
                                        <span>•</span>
                                        <span>{formatTime(message.timestamp)}</span>
                                    </div>
                                </div>
                                {lastMessagePosition === index && hasError && (
                                    <div className="flex items-center h-10.5 text-xs text-muted-foreground">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center h-10.5 text-xs text-muted-foreground"
                                            onClick={() => retryMessage(message)}>
                                            <div className="flex items-center justify-center w-6 h-6 bg-red-500/60 rounded-full p-1">
                                                <svg fill="#ffffff" width="22px" height="22px" viewBox="-1.12 -1.12 18.24 18.24" stroke="#ffffff" aria-label="Error" role="img">
                                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                                    <g id="SVGRepo_iconCarrier">
                                                        <path d="M7 12v-2l-4 3 4 3v-2h2.997A6.006 6.006 0 0 0 16 8h-2a4 4 0 0 1-3.996 4H7zM9 2H6.003A6.006 6.006 0 0 0 0 8h2a4 4 0 0 1 3.996-4H9v2l4-3-4-3v2z" fillRule="evenodd">
                                                        </path>
                                                    </g>
                                                </svg>
                                            </div>
                                        </Button>
                                    </div>

                                )}
                            </div>
                        </div>
                    ))
                )}

                {loading && !isThinking && (
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
                                        <span className="text-sm text-muted-foreground">Joker is typing...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {isThinking && thinkingMessage && (
                    <div className="flex justify-start">
                        <div className="flex items-start space-x-3 max-w-[80%]">

                            <div className="flex flex-col space-y-1">
                                <div className="px-4 py-3 rounded-2xl ">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-50/90">
                                        Thinking....
                                        {thinkingMessage.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm p-4">
                <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                    <div className="flex-1">
                        {audioRecording && audioUrl ? (
                            <div className="flex w-full resize-none border-border/50 focus:border-secondary focus:ring-secondary/20">
                                <audio src={audioUrl} controls className="flex-1">
                                    <track default kind="captions" />
                                </audio>
                            </div>
                        ) : (
                            <Input
                                type="text"
                                placeholder="Type your message..."
                                value={input}
                                onChange={onInputChange}
                                onKeyPress={handleKeyPress}
                                disabled={loading || isRecording}
                                className="w-full resize-none border-border/50 focus:border-secondary focus:ring-secondary/20"
                            />
                        )}
                    </div>
                    <RecordingAudioComponent isRecording={isRecording} audioRecording={audioRecording} startRecording={startRecording} stopRecording={stopRecording} deleteAudioRecording={clearAudioRecording} />
                    <Button
                        type="submit"
                        disabled={(!input.trim() && !audioRecording) || loading}
                        loading={loading}
                        className="px-6 h-10 bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    >
                        {loading ? "Sending..." : "Send"}
                    </Button>
                </form>

                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    <span>{input.length}/1000</span>
                </div>
            </div>
        </div>
    );
} 