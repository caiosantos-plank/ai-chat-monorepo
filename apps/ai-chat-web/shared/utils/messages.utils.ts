import {
	AIMessage,
	type BaseMessage,
	HumanMessage,
} from "@langchain/core/messages";
import type { UIMessage } from "ai";
import { type AgentCalls, Message } from "@/shared/types/entities";
import { jsonTryParse } from "./json.utils";

export function parseAgentMessagesToSupabase(
	message: BaseMessage,
	agentCalls?: AgentCalls,
) {
	return {
		content: message.content as string,
		role: message instanceof HumanMessage ? "user" : "assistant",
		agentCalls,
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

export function parseStreamMessageToMessage(message: UIMessage | Message) {
	const parsedContent = jsonTryParse(message.content);

	if (!parsedContent) {
		return new Message(
			message.id,
			message.content,
			message.role,
			"timestamp" in message ? message.timestamp : new Date(),
			"agentCalls" in message ? message.agentCalls : undefined,
		);
	}

	return new Message(
		parsedContent.id,
		parsedContent.content,
		parsedContent.role,
		parsedContent.createdAt ?? new Date(),
		parsedContent.agentCalls,
	);
}
