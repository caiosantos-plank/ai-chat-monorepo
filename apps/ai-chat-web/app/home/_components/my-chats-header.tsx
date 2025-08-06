"use client";

import { createChat } from "@/app/home/actions";
import Button from "@/shared/components/ui/buttons/button";


export default function MyChatsHeader() {
    const createNewChat = async () => {
        await createChat("New Chat");
    };

    return <>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">My Chats</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your conversations and start new ones
                </p>
            </div>
            <form>
                <Button variant="default" size="md" onClick={createNewChat}>
                    <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    New Chat
                </Button>
            </form>
        </div>
    </>
}