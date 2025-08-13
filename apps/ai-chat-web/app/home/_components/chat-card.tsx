"use client";

import Link from "next/link";
import type { Chat } from "@/shared/types/entities";
import Card from "@/shared/components/ui/card/card";
import CardHeader from "@/shared/components/ui/card/card-header";
import CardTitle from "@/shared/components/ui/card/card-title";

interface ChatCardProps {
    chat: Chat;
    index?: number;
}

export default function ChatCard({ chat, index = 0 }: ChatCardProps) {
    return (
        <Link href={`/home/${chat.id}`} className="block group" style={{ transitionDelay: `${index * 30}ms` }}>
            <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />

                <Card className="h-full overflow-hidden border-border/50 hover:border-secondary/30 transition-all duration-300 group-hover:shadow-md group-hover:translate-y-[-1px]">
                    <CardHeader className="py-2">
                        <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-sm font-semibold truncate px-1">
                                {chat.name}
                            </CardTitle>
                            <span className="inline-flex items-center justify-center rounded-md text-muted-foreground/70 group-hover:text-foreground transition-colors pointer-events-none">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </span>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </Link>
    );
}

