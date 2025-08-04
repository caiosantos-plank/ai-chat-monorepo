import { BaseMessage, HumanMessage } from "@langchain/core/messages";
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

async function saveChatHistory(id: string, messages: BaseMessage[]) {
	const supabaseMessages = parseAgentMessagesToSupabase(messages);

	await chatHistoryService.saveChatHistory(
		id,
		JSON.stringify(supabaseMessages),
		"",
	);
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

	let response: BaseMessage[];
	const history = await getAllStateHistory(config);
	if (history.length === 0) {
		const messages = await getChatHistory(id);

		response = (
			await agent.graph.invoke(
				{
					messages: [...messages, new HumanMessage(message)],
				},
				config,
			)
		).messages;
	} else {
		response = (
			await agent.graph.invoke(
				{
					messages: [new HumanMessage(message)],
				},
				config,
			)
		).messages;
	}

	await saveChatHistory(id, response);
	const lastMessage = response.at(-1);

	return NextResponse.json({ message: lastMessage });
}
