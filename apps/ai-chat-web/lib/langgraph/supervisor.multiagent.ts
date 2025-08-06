import type { ChatGroq } from "@langchain/groq";
import {
	Annotation,
	Command,
	END,
	MemorySaver,
	MessagesAnnotation,
	START,
	StateGraph,
} from "@langchain/langgraph";
import { v4 as uuid } from "uuid";
import {
	AIMessage,
	HumanMessage,
	RemoveMessage,
} from "@langchain/core/messages";
import z from "zod";
import {
	searchToolNode,
	searchTools,
	weatherToolNode,
	weatherTools,
} from "./tools";

const AgentState = Annotation.Root({
	...MessagesAnnotation.spec,
	goingTo: Annotation<string[]>({
		reducer: (x, y) => y,
	}),
	agentCalls: Annotation<Record<string, number>>({
		reducer: (x, y) => ({ ...x, ...y }),
	}),
	summary: Annotation<string>({
		reducer: (_, action) => action,
		default: () => "",
	}),
});

export class Supervisor {
	private model: ChatGroq;
	private memorySaver = new MemorySaver();

	constructor(model: ChatGroq) {
		this.model = model;
	}

	private hasToContinue(state: typeof AgentState.State) {
		const { messages, goingTo } = state;
		const lastMessage = messages.at(-1);

		if (
			lastMessage &&
			"tool_calls" in lastMessage &&
			Array.isArray(lastMessage.tool_calls) &&
			lastMessage.tool_calls?.length
		) {
			return goingTo;
		}
		return END;
	}

	private weatherAgent = async (state: typeof AgentState.State) => {
		const modelWithTools = this.model.bindTools(weatherTools);

		const response = await modelWithTools.invoke([
			{
				role: "system",
				content: [
					"You are a weather expert, and you are responsible to provide the weather information.",
					" You cannot answer questions that are not related to the weather.",
					" You have access to the following tools: get_weather.",
					" You must send just the location to the get_weather tool, do not include any other text.",
					" Do not include words like city, country, state, etc. Just the location name.",
					" You must avoid call to the same tool twice.",
				].join(""),
			},
			...state.messages,
		]);

		if (response.tool_calls && response.tool_calls.length > 0) {
			return new Command({
				goto: "weather_tool",
				update: {
					...state.agentCalls,
					messages: response,
					goingTo: "weather_tool",
				},
			});
		}

		return new Command({
			goto: "chat_agent",
			update: {
				messages: response,
				goingTo: "chat_agent",
				agentCalls: {
					...state.agentCalls,
					weather_expert: (state.agentCalls?.weather_expert ?? 0) + 1,
				},
			},
		});
	};

	private newsAgent = async (state: typeof AgentState.State) => {
		const modelWithTools = this.model.bindTools(searchTools);

		const response = await modelWithTools.invoke([
			{
				role: "system",
				content: [
					"You are a news expert, and you are responsible to provide the latest news information.",
					" You cannot answer questions that are not related to the latest news.",
					" You will be given a task and you need to complete the task.",
					" You have access to the following tools: get_latest_news.",
					" You must avoid call to the same tool twice.",
				].join(""),
			},
			...state.messages,
		]);

		if (response.tool_calls && response.tool_calls.length > 0) {
			return new Command({
				goto: "search_tool",
				update: {
					...state.agentCalls,
					messages: response,
					goingTo: "search_tool",
				},
			});
		}

		return new Command({
			goto: "chat_agent",
			update: {
				messages: response,
				goingTo: "chat_agent",
				agentCalls: {
					...state?.agentCalls,
					news_expert: (state.agentCalls?.news_expert ?? 0) + 1,
				},
			},
		});
	};

	private chatAgent = async (state: typeof AgentState.State) => {
		const possibleDestinations = ["summarizer_agent", END];

		const responseSchema = z.object({
			response: z
				.string()
				.describe(
					"A human readable response to the original question. Does not need to be a final response. Will be streamed back to the user.",
				),
			goto: z
				.enum(possibleDestinations)
				.describe(
					"The next agent to call, or __end__ if the user's query has been resolved. Must be one of the specified values.",
				),
		});

		console.log("chat agent called", state.messages.length);

		const response = await this.model
			.withStructuredOutput(responseSchema, {
				name: "router",
			})
			.invoke([
				{
					role: "system",
					content: [
						"You are a friendly cowboy chat agent from Texas.",
						"You speak with a Southern drawl and use typical Texan slang and expressions like “howdy”, “y’all”, “reckon”, “dang”, “partner”, “ain’t”, and “mighty fine”.",
						"Your tone is warm, polite, and laid-back, just like a true cowboy host.",
						"You enjoy throwin’ in a little charm and praise now and then, makin’ the user feel right at home—like they’re sittin’ on a porch sippin’ sweet tea.",
						"Always keep the conversation friendly, respectful, and full of that down-home cowboy hospitality",
					].join(""),
				},
				...state.messages,
			]);

		const aiMessage = {
			role: "assistant",
			content: response.response,
			name: "chat_agent",
		};

		console.log("chat response", aiMessage);

		return new Command({
			goto: state.messages.length >= 6 ? "summarizer_agent" : END,
			update: {
				messages: aiMessage,
				goingTo: state.messages.length >= 6 ? "summarizer_agent" : END,
				agentCalls: {
					chat_agent: 0,
					weather_expert: 0,
					news_expert: 0,
					supervisor: 0,
				},
			},
		});
	};

	private summarizerAgent = async (state: typeof AgentState.State) => {
		const { summary, messages } = state;

		const responseSchema = z.object({
			response: z
				.string()
				.describe(
					"A human readable response to the original question. Does not need to be a final response. Will be streamed back to the user.",
				),
			goto: z
				.enum(["__end__"])
				.describe(
					"The next agent to call, or __end__ if the user's query has been resolved. Must be one of the specified values.",
				),
		});

		let prompt = "";
		if (summary) {
			prompt = [
				`This is summary of the conversation to date: ${summary}\n\n`,
				"Extend the summary by taking into account the new messages above",
			].join("");
		} else {
			prompt = "Create a summary of the conversation to above";
		}

		const allMessages = [
			...messages,
			new HumanMessage({
				id: uuid(),
				content: prompt,
			}),
		];

		const response = await this.model
			.withStructuredOutput(responseSchema, {
				name: "router",
			})
			.invoke(allMessages);

		const lastMessage = state.messages.at(-1);
		const deletedMessages = state.messages.map(
			(message) =>
				new RemoveMessage({
					id: message.id ?? new Date().getDate().toString(),
				}),
		);

		return new Command({
			goto: END,
			update: {
				summary: response.response,
				messages: [
					...deletedMessages,
					new AIMessage(response.response),
					new AIMessage(lastMessage?.content.toString() ?? ""),
				],
			},
		});
	};

	private supervisorAgent = async (state: typeof AgentState.State) => {
		const possibleDestinations = [
			"chat_agent",
			"weather_expert",
			"news_expert",
		];

		const responseSchema = z.object({
			response: z
				.string()
				.describe(
					"Direct response to the agent saying what to do next. Do not include any other text.",
				),
			goto: z
				.enum(possibleDestinations)
				.describe(
					"The next agent to call Must be one of the specified values.",
				),
		});

		const response = await this.model
			.withStructuredOutput(responseSchema, {
				name: "router",
			})
			.invoke([
				{
					role: "system",
					content: [
						"You are a supervisor agent responsible for coordinating other specialized agents based on the user's input.",
						"Your task is to analyze the user's message and delegate it to the most appropriate agent.",
						"You must avoid call the same agent twice.",
						"If the user explicitly asks about the weather, you must call the weather_expert with the location to get the weather (Response must have only the location).",
						"If the user is asking about news, you must call the news_expert.",
						"If the user is simply engaging in casual conversation or introducing themselves informally, you must call the chat_agent.",
						"Ensure that you return only the required information to the other agents.",
					].join(""),
				},
				...state.messages,
			]);

		const aiMessage = {
			role: "assistant",
			content: response.response,
			name: "supervisor",
		};

		return new Command({
			goto: response.goto,
			update: {
				messages: aiMessage,
				goingTo: response.goto,
				agentCalls: {
					...state.agentCalls,
					supervisor: (state.agentCalls?.supervisor ?? 0) + 1,
				},
			},
		});
	};

	public graph = new StateGraph(AgentState)
		.addNode("supervisor", this.supervisorAgent)
		.addNode("weather_tool", weatherToolNode, {
			retryPolicy: {
				maxAttempts: 3,
			},
		})
		.addNode("weather_expert", this.weatherAgent, {
			retryPolicy: {
				maxAttempts: 3,
			},
		})
		.addNode("search_tool", searchToolNode, {
			retryPolicy: {
				maxAttempts: 3,
			},
		})
		.addNode("news_expert", this.newsAgent, {
			retryPolicy: {
				maxAttempts: 3,
			},
		})
		.addNode("chat_agent", this.chatAgent)
		.addNode("summarizer_agent", this.summarizerAgent)

		.addEdge(START, "supervisor")
		.addConditionalEdges(
			"supervisor",
			(state: typeof AgentState.State) => {
				console.log("state", state.goingTo);
				return state.goingTo;
			},
			{
				chat_agent: "chat_agent",
				weather_expert: "weather_expert",
				news_expert: "news_expert",
			},
		)

		.addConditionalEdges("weather_expert", this.hasToContinue, {
			__end__: "__end__",
			weather_tool: "weather_tool",
		})

		.addConditionalEdges("news_expert", this.hasToContinue, {
			__end__: "__end__",
			search_tool: "search_tool",
		})
		.addEdge("weather_tool", "chat_agent")
		.addEdge("search_tool", "chat_agent")

		.addConditionalEdges(
			"chat_agent",
			(state: typeof AgentState.State) => {
				return state.goingTo;
			},
			{
				summarizer_agent: "summarizer_agent",
				__end__: "__end__",
			},
		)

		.addEdge("summarizer_agent", END)
		.compile({
			checkpointer: this.memorySaver,
		});
}
