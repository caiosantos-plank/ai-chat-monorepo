"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/shared/components/ui/buttons/button";
import type { Chat } from "@/shared/types/entities";

interface SidebarProps {
    chats: Chat[];
    activeChatId?: string;
    createNewChat: () => void;
    deleteChat: (chatId: string, shouldRedirect: boolean) => void;
}

export default function Sidebar({ chats, activeChatId, createNewChat, deleteChat }: SidebarProps) {
    const pathname = usePathname();

    const handleDeleteChat = (chatId: string) => {
        deleteChat(chatId, false);
    }

    return (
        <aside className="w-full md:w-72 lg:w-80 border-r border-border/50 bg-card/40 backdrop-blur-sm h-[calc(100vh-4rem)] sticky top-16">
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-muted-foreground">Your Chats</h2>
                        <Button size="sm" variant="outline" onClick={createNewChat}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </Button>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {chats?.length ? (
                        chats.map((chat, index) => {
                            const isActive = (activeChatId && chat.id === activeChatId) || pathname.endsWith(`/chat/${chat.id}`);
                            return (
                                <Link
                                    key={chat.id}
                                    href={`/chat/${chat.id}`}
                                    className={`group block rounded-lg px-3 py-2 transition-all duration-200 ${isActive
                                        ? "bg-secondary/10 border border-secondary/20 shadow-sm"
                                        : "hover:bg-muted/50 border border-transparent"
                                        }`}
                                    style={{ transitionDelay: `${index * 20}ms` }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={`text-sm font-medium truncate ${isActive ? "text-foreground" : "text-foreground"}`}>
                                            {chat.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => handleDeleteChat(chat.id)}>
                                                <span className="inline-flex items-center justify-center rounded-md text-muted-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </span>
                                            </Button>

                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        {new Date(chat.created_at).toLocaleDateString()}
                                    </p>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="p-3 text-sm text-muted-foreground">
                            No chats yet
                        </div>
                    )}
                </nav>
            </div>
        </aside>
    );
}

