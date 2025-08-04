import { createClient } from "@/lib/supabase/server";
import type { Chat } from "@/shared/types/entities";
import type Response from "@/shared/types/response";

export async function createChat(chat: Partial<Chat>): Promise<Response<Chat>> {
	try {
		const supabase = await createClient();
		const { data: session } = await supabase.auth.getUser();

		const { data, error } = await supabase
			.from("chat")
			.insert({ ...chat, user_id: session.user?.id })
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

export async function getChats(
	chatId?: string,
): Promise<Response<Chat[] | null>> {
	try {
		const supabase = await createClient();
		const query = supabase.from("chat").select("*");

		if (chatId) {
			query.eq("id", chatId);
		}

		const { data, error } = await query;

		if (error) {
			throw new Error("Failed to get chat");
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
