import { createClient } from "@/lib/supabase/server";
import type { ChatHistory } from "@/shared/types/entities";
import type Response from "@/shared/types/response";

interface ChatHistoryServiceInterface {
	saveChatHistory(
		chatId: string,
		messages: {
			content: string;
			role: string;
		}[],
		summary: string,
	): Promise<Response<void>>;
	createChatMessage(messsage: string): Promise<Response<void>>;
}

export default class ChatHistoryService implements ChatHistoryServiceInterface {
	async saveChatHistory(
		chatId: string,
		messages: {
			content: string;
			role: string;
		}[],
		summary: string,
	): Promise<Response<void>> {
		try {
			const supabase = await createClient();

			const { data, error } = await supabase
				.from("chat_history")
				.upsert({
					id: chatId,
					messages: JSON.stringify(messages),
					summary: summary,
				})
				.select()
				.single();

			if (error) {
				throw new Error("Failed to save chat history");
			}

			return {
				data,
				error: null,
			};
		} catch (error) {
			return {
				data: null,
				error: error instanceof Error ? error.message : "Something went wrong",
			};
		}
	}

	async getChatHistory(chatId: string): Promise<Response<ChatHistory>> {
		try {
			const supabase = await createClient();

			const { data, error } = await supabase
				.from("chat_history")
				.select("*")
				.eq("id", chatId)
				.single();

			if (error) {
				throw new Error("Failed to get chat history");
			}

			return {
				data,
				error: null,
			};
		} catch (error) {
			return {
				data: null,
				error: error instanceof Error ? error.message : "Something went wrong",
			};
		}
	}

	async createChatMessage(): Promise<Response<void>> {
		try {
			return {
				data: null,
				error: null,
			};
		} catch (error) {
			return {
				data: null,
				error: error instanceof Error ? error.message : "Something went wrong",
			};
		}
	}
}
