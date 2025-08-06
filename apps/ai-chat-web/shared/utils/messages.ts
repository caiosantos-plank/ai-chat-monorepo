import {
	AIMessage,
	type BaseMessage,
	HumanMessage,
} from "@langchain/core/messages";

export function parseAgentMessagesToSupabase(message: BaseMessage) {
	return {
		content: message.content as string,
		role: message instanceof HumanMessage ? "user" : "assistant",
	};
}

export function parseSupabaseMessagesToAgentMessages(
	messages: {
		content: string;
		role: string;
	}[],
) {
	return messages.map((message) => {
		if (message.role === "assistant") {
			return new AIMessage(message.content);
		}
		return new HumanMessage(message.content);
	});
}
