import {
	type BaseMessage,
	HumanMessage,
	SystemMessage,
} from "@langchain/core/messages";
import { createModel } from "@/lib/langgraph/model";
import { Supervisor } from "@/lib/langgraph/supervisor.multiagent";
import ChatHistoryService from "@/services/chat-history.service";
import type { AgentCalls } from "@/shared/types/entities";
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
	agentCalls: AgentCalls,
) {
	const parsedMessage = parseAgentMessagesToSupabase(message, agentCalls);
	const history = [
		...currentHistory.map((message) =>
			parseAgentMessagesToSupabase(message, agentCalls),
		),
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
	const { messages } = await request.json();
	const message = messages.at(-1)?.content;

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

	const stream = new ReadableStream({
		async start(controller) {
			console.log("start stream");
			try {
				const graphStream = await agent.graph.stream(
					{
						messages: [...chatHistory, userMessage],
					},
					config,
				);

				let lastMessage: BaseMessage | null = null;
				let finalMessage: BaseMessage | null = null;

				for await (const chunk of graphStream) {
					const currentMessages = chunk.messages;
					const latestMessage = currentMessages[currentMessages.length - 1];

					if (latestMessage && latestMessage !== lastMessage) {
						lastMessage = latestMessage;
						finalMessage = latestMessage;
					}
				}

				const finalStateHistory = await getAllStateHistory(config);
				const { summary, agentCalls } = finalStateHistory[0].values;

				if (finalMessage) {
					await saveStateToChatHistory(
						id,
						summary,
						[...storedChatHistory, userMessage],
						finalMessage,
						agentCalls,
					);
				}

				controller.enqueue(
					new TextEncoder().encode(
						JSON.stringify({ ...finalMessage, agentCalls }),
					),
				);
				controller.close();
			} catch (error) {
				console.error("Streaming error:", error);
				const errorData = {
					id: `error_${Date.now()}`,
					role: "assistant",
					content: "Sorry, I encountered an error. Please try again.",
					createdAt: new Date().toISOString(),
				};

				controller.enqueue(
					new TextEncoder().encode(`data: ${JSON.stringify(errorData)}\n\n`),
				);

				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}
