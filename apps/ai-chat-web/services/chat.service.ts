"use server";

import { createClient } from "@/lib/supabase/server";
import type { Chat } from "@/shared/types/entities";
import type Response from "@/shared/types/response";

interface ChatServiceInterface {
	createChat: (chat: Partial<Chat>) => Promise<Response<Chat>>;
}

export default class ChatService implements ChatServiceInterface {
	async createChat(chat: Partial<Chat>): Promise<Response<Chat>> {
		try {
			const supabase = await createClient();

			const { data, error } = await supabase
				.from("chats")
				.insert(chat)
				.select()
				.single();

			if (error) {
				throw new Error("Failed to create chat");
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
}
