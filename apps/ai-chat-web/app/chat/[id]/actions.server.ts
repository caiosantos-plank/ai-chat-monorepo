"use server";

import ChatHistoryService from "@/services/chat-history.service";

const chatHistoryService = new ChatHistoryService();

export async function getChatHistory(chatId: string) {
	const { data: chatHistory } = await chatHistoryService.getChatHistory(chatId);

	return chatHistory;
}

export async function clearChatHistory(chatId: string) {
	await chatHistoryService.clearChatHistory(chatId);
}
