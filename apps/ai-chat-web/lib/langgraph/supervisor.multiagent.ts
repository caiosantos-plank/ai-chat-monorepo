import type { ChatGroq } from "@langchain/groq";
import {
	Annotation,
	Command,
	END,
	MemorySaver,
	type MessagesAnnotation,
	START,
	StateGraph,
} from "@langchain/langgraph";
import { AIMessage, type BaseMessage } from "@langchain/core/messages";
import z from "zod";
import { tools } from "./tools";

const AgentState = Annotation.Root({
	messages: Annotation<BaseMessage[]>({
		reducer: (x, y) => x.concat(y),
	}),
	goingTo: Annotation<string[]>({
		reducer: (x, y) => y,
	}),
	agentCalls: Annotation<Record<string, number>>({
		reducer: (x, y) => ({ ...x, ...y }),
	}),
});

export class Supervisor {
	private model: ChatGroq;
	private memorySaver = new MemorySaver();

	constructor(model: ChatGroq) {
		this.model = model;
	}

	private hasToContinue(state: typeof MessagesAnnotation.State) {
		const { messages } = state;
		const lastMessage = messages.at(-1);

		if (
			lastMessage &&
			"tool_calls" in lastMessage &&
			Array.isArray(lastMessage.tool_calls) &&
			lastMessage.tool_calls?.length
		) {
			return "tools";
		}
		return END;
	}

	private weatherAgent = async (state: typeof AgentState.State) => {
		if (
			state.agentCalls?.weather_expert &&
			state.agentCalls.weather_expert > 1
		) {
			return new Command({
				goto: "chat_agent",
				update: {
					messages: [
						...state.messages,
						new AIMessage("I already gave the weather information"),
					],
					goingTo: "chat_agent",
				},
			});
		}
		const modelWithTools = this.model.bindTools(tools.tools);

		const response = await modelWithTools.invoke([
			{
				role: "system",
				content: [
					"You are a weather expert, and you are responsible to provide the weather information.",
					" You cannot answer questions that are not related to the weather.",
					" You have access to the following tools: get_weather.",
					" You must avoid call to the same tool twice.",
				].join(""),
			},
			...state.messages,
		]);

		console.log("weather agent called");

		if (response.tool_calls && response.tool_calls.length > 0) {
			return new Command({
				goto: "tools",
				update: {
					...state.agentCalls,
					messages: response,
					goingTo: "tools",
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
		if (state.agentCalls?.news_expert && state.agentCalls.news_expert > 1) {
			return new Command({
				goto: "chat_agent",
				update: {
					messages: [
						...state.messages,
						new AIMessage("I already gave the news information"),
					],
					goingTo: "chat_agent",
				},
			});
		}
		const modelWithTools = this.model.bindTools(tools.tools);

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

		console.log("news agent called");

		if (response.tool_calls && response.tool_calls.length > 0) {
			return new Command({
				goto: "tools",
				update: {
					...state.agentCalls,
					messages: response,
					goingTo: "tools",
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
		const possibleDestinations = ["__end__"];

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

		console.log("chat agent called", response.goto);

		const aiMessage = {
			role: "assistant",
			content: response.response,
			name: "chat_agent",
		};

		return new Command({
			goto: "__end__",
			update: {
				messages: aiMessage,
				goingTo: "__end__",
				agentCalls: {
					chat_agent: 0,
					weather_expert: 0,
					news_expert: 0,
					supervisor: 0,
				},
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

		console.log("supervisor agent called", response);

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
		.addNode("tools", tools)
		.addNode("weather_expert", this.weatherAgent)
		.addNode("news_expert", this.newsAgent)
		.addNode("chat_agent", this.chatAgent)

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
			tools: "tools",
		})

		.addConditionalEdges("news_expert", this.hasToContinue, {
			__end__: "__end__",
			tools: "tools",
		})
		.addEdge("tools", "chat_agent")

		.addEdge("weather_expert", "chat_agent")
		.addEdge("news_expert", "chat_agent")

		.addEdge("chat_agent", "__end__")
		.compile({
			checkpointer: this.memorySaver,
		});
}
