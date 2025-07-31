import type Response from "@/shared/types/response";

interface ChatMessagesServiceInterface {
	createChatMessage(messsage: string): Promise<Response<void>>;
}

export default class ChatMessagesService
	implements ChatMessagesServiceInterface
{
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
