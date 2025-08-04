import ChatHistoryService from "@/services/chat-history.service";

export async function getChatHistory(chatId: string) {
	const chatHistoryService = new ChatHistoryService();
	const { data: chatHistory } = await chatHistoryService.getChatHistory(chatId);

	return chatHistory;
}
