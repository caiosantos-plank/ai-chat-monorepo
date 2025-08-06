import { ChatWrapper } from "./_components";
import { getChatHistory } from "./actions.server";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const chatHistory = await getChatHistory(id);

    const messages = JSON.parse(chatHistory?.messages ?? "[]").map((message: { content: string, role?: string }, index: number) => ({
        id: index.toString(),
        content: message.content,
        role: message.role === "assistant" ? "assistant" : "user",
        timestamp: new Date(),
    }));

    return (
        <div>
            <ChatWrapper chatId={id} history={messages} />
        </div>
    );
}