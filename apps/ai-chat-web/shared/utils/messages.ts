import {
	AIMessage,
	type BaseMessage,
	HumanMessage,
} from "@langchain/core/messages";

export function parseAgentMessagesToSupabase(messages: BaseMessage[]) {
	return messages.map((message) => ({
		content: message.content,
		role:
			"role" in message && message.role === "assistant" ? "assistant" : "user",
	}));
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
