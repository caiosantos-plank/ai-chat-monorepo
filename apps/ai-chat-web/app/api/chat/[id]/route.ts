import { type BaseMessage, HumanMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";
import { createModel } from "@/lib/langgraph/model";
import { Supervisor } from "@/lib/langgraph/supervisor.multiagent";
import ChatHistoryService from "@/services/chat-history.service";
import {
	parseAgentMessagesToSupabase,
	parseSupabaseMessagesToAgentMessages,
} from "@/shared/utils";

const model = await createModel();
const agent = new Supervisor(model);
const chatHistoryService = new ChatHistoryService();

async function getAllStateHistory(config: {
	configurable: { thread_id: string };
	streamMode: "values";
}) {
	const history = [];
	const stateHistoryIterator = agent.graph.getStateHistory(config);

	for await (const state of stateHistoryIterator) {
		history.push(state);
	}

	return history;
}

async function saveMessageToChatHistory(
	id: string,
	currentHistory: BaseMessage[],
	message: BaseMessage,
) {
	const parsedMessage = parseAgentMessagesToSupabase(message);
	const history = [
		...currentHistory.map(parseAgentMessagesToSupabase),
		parsedMessage,
	];

	await chatHistoryService.saveChatHistory(id, history, "");
}

async function getChatHistory(id: string) {
	const { data: chatHistory } = await chatHistoryService.getChatHistory(id);
	const messages = JSON.parse(chatHistory?.messages ?? "[]");

	return parseSupabaseMessagesToAgentMessages(messages);
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const { message } = await request.json();

	const config = {
		configurable: { thread_id: id },
		streamMode: "values" as const,
	};

	const agentStateHistory = await getAllStateHistory(config);
	const storedChatHistory = await getChatHistory(id);
	const chatHistory = agentStateHistory.length === 0 ? storedChatHistory : [];

	const userMessage = new HumanMessage(message);

	const response = (
		await agent.graph.invoke(
			{
				messages: [...chatHistory, new HumanMessage(message)],
			},
			config,
		)
	).messages;

	const lastMessage = response.at(-1);

	if (lastMessage) {
		await saveMessageToChatHistory(
			id,
			[...storedChatHistory, userMessage],
			lastMessage,
		);
	}

	return NextResponse.json({ message: lastMessage });
}
