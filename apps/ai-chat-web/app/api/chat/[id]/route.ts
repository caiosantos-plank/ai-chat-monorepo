import {
	type BaseMessage,
	HumanMessage,
	SystemMessage,
} from "@langchain/core/messages";
import { AudioProcessorClient } from "@/lib/groq";
import { createModel } from "@/lib/langgraph/model";
import { type NextRequest, NextResponse } from "next/server";
import ChatHistoryService from "@/services/chat-history.service";
import type { AgentCalls } from "@/shared/types/entities";
import {
	parseAgentMessagesToSupabase,
	parseSupabaseMessagesToAgentMessages,
} from "@/shared/utils";
import OrchestratorGraph from "@/lib/langgraph/orchestrator.graph";

const model = await createModel();
const audioProcessor = new AudioProcessorClient();
const agent = new OrchestratorGraph(model, audioProcessor);

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

async function loadMessageHistory(
	chatId: string,
	config: {
		configurable: { thread_id: string };
		streamMode: "values";
	},
) {
	const agentStateHistory = await getAllStateHistory(config);
	const { messages: storedChatHistory, summary: storedSummary } =
		await getChatHistory(chatId);

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
	return { storedChatHistory, chatHistory };
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	const { searchParams } = new URL(request.url);
	const isAudio = searchParams.get("isAudio") === "true";
	let audio: File | null = null;

	console.log("header", request.headers.get("content-type"));

	let formData: FormData | null = null;
	if (isAudio) {
		formData = await request.formData();
		audio = formData.get("audio") as File;
	}

	const { messages } = !isAudio
		? await request.json()
		: { messages: formData?.get("messages") ?? [] };
	const message = messages.at(-1)?.content;

	const config = {
		configurable: { thread_id: id },
		streamMode: "values" as const,
	};

	const { chatHistory, storedChatHistory } = await loadMessageHistory(
		id,
		config,
	);

	let userMessage = new HumanMessage(!isAudio ? message : "");

	const stream = new ReadableStream({
		async start(controller) {
			try {
				const graphStream = await agent.graph.stream(
					{
						messages: isAudio ? chatHistory : [...chatHistory, userMessage],
						recordings: isAudio && audio ? [audio] : [],
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

						if (lastMessage instanceof HumanMessage && isAudio) {
							userMessage = lastMessage;
							controller.enqueue(
								new TextEncoder().encode(
									JSON.stringify({ ...lastMessage, role: "user" }),
								),
							);
						}
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
