import type { AgentCalls, Chat } from "@/shared/types/entities";
import { ChatWrapper, Sidebar } from "./_components";
import { getChats } from "@/services/chat.service";
import { getChatHistory } from "./actions.server";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: chats } = await getChats();
    const chatHistory = await getChatHistory(id);

    const messages = JSON.parse(chatHistory?.messages ?? "[]").map((message: { content: string, role?: string, agentCalls?: AgentCalls }, index: number) => ({
        id: index.toString(),
        content: message.content,
        role: message.role === "assistant" ? "assistant" : "user",
        timestamp: new Date(),
        agentCalls: message.agentCalls,
    }));

    return (
        <div className="container mx-auto px-4">
            <div className="flex gap-4">
                <div className="hidden md:block">
                    <Sidebar chats={(chats as Chat[]) ?? []} activeChatId={id} />
                </div>
                <div className="flex-1">
                    <ChatWrapper chatId={id} history={messages} />
                </div>
            </div>
        </div>
    );
}