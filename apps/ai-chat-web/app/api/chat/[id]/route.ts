import {
	type BaseMessage,
	HumanMessage,
	SystemMessage,
} from "@langchain/core/messages";
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

async function saveStateToChatHistory(
	id: string,
	summary: string,
	currentHistory: BaseMessage[],
	message: BaseMessage,
) {
	const parsedMessage = parseAgentMessagesToSupabase(message);
	const history = [
		...currentHistory.map(parseAgentMessagesToSupabase),
		parsedMessage,
	];

	await chatHistoryService.saveChatHistory(id, summary, history);
}

async function getChatHistory(id: string) {
	const { data: chatHistory } = await chatHistoryService.getChatHistory(id);
	const messages = JSON.parse(chatHistory?.messages ?? "[]");

	return {
		messages: parseSupabaseMessagesToAgentMessages(messages),
		summary: chatHistory?.summary,
	};
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
	const { messages: storedChatHistory, summary: storedSummary } =
		await getChatHistory(id);
	const chatHistory =
		agentStateHistory.length === 0
			? storedSummary
				? [
						new SystemMessage(
							`Summary of conversation earlier: ${storedSummary}`,
						),
					]
				: storedChatHistory
			: [];

	const userMessage = new HumanMessage(message);

	const response = (
		await agent.graph.invoke(
			{
				messages: [...chatHistory, new HumanMessage(message)],
			},
			config,
		)
	).messages;

	const lastMessage = response.at(-1) as BaseMessage;
	const { summary } = (await getAllStateHistory(config))[0].values;

	if (lastMessage) {
		await saveStateToChatHistory(
			id,
			summary,
			[...storedChatHistory, userMessage],
			lastMessage,
		);
	}

	return NextResponse.json({
		message: {
			...lastMessage,
		},
	});
}
