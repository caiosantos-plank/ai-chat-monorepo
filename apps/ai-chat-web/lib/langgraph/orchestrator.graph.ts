import type { ChatGroq } from "@langchain/groq";
import {
	Command,
	END,
	MemorySaver,
	START,
	StateGraph,
} from "@langchain/langgraph";
import z from "zod";
import type { AudioProcessorClient } from "../groq";
import {
	AgentState,
	ChatAgent,
	InputProcessorAgent,
	NewsAgent,
	SummarizerAgent,
	WeatherAgent,
} from "./agents";
import { searchToolNode, weatherToolNode } from "./tools";

export default class OrchestratorGraph {
	private readonly model: ChatGroq;
	private memorySaver = new MemorySaver();

	private readonly audioProcessor: AudioProcessorClient;

	private inputProcessorAgent: InputProcessorAgent;
	private weatherAgent: WeatherAgent;
	private newsAgent: NewsAgent;
	private chatAgent: ChatAgent;
	private summarizerAgent: SummarizerAgent;

	public graph;

	constructor(model: ChatGroq, audioProcessor: AudioProcessorClient) {
		this.model = model;
		this.audioProcessor = audioProcessor;

		this.inputProcessorAgent = new InputProcessorAgent(this.audioProcessor);
		this.weatherAgent = new WeatherAgent(this.model);
		this.newsAgent = new NewsAgent(this.model);
		this.chatAgent = new ChatAgent(this.model);
		this.summarizerAgent = new SummarizerAgent(this.model);

		this.graph = this.createGraph();
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

	private orchestratorAgent = async (state: typeof AgentState.State) => {
		const destinations = ["weather_expert", "news_expert", "chat_agent"];

		const responseSchema = z.object({
			response: z
				.string()
				.describe(
					"Direct response to the agent saying what to do next. Do not include any other text.",
				),
			goto: z
				.enum(destinations)
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
			name: "orchestrator",
		};

		console.log("orchestrator agent called");

		return new Command({
			goto: response.goto,
			update: {
				messages: aiMessage,
				goingTo: response.goto,
				agentCalls: {
					weather_expert: 0,
					news_expert: 0,
					supervisor: 1,
				},
			},
		});
	};

	private createGraph() {
		return (
			new StateGraph(AgentState)
				.addNode("input_processor", this.inputProcessorAgent.execute)
				.addNode("orchestrator", this.orchestratorAgent)
				.addNode("weather_expert", this.weatherAgent.execute, {
					retryPolicy: {
						maxAttempts: 3,
					},
				})
				.addNode("weather_tool", weatherToolNode, {
					retryPolicy: {
						maxAttempts: 3,
					},
				})
				.addNode("news_expert", this.newsAgent.execute, {
					retryPolicy: {
						maxAttempts: 3,
					},
				})
				.addNode("search_tool", searchToolNode, {
					retryPolicy: {
						maxAttempts: 3,
					},
				})
				.addNode("chat_agent", this.chatAgent.execute)
				.addNode("summarizer_agent", this.summarizerAgent.execute)

				.addEdge(START, "input_processor")
				.addEdge("input_processor", "orchestrator")
				// .addEdge(START, "orchestrator")
				.addConditionalEdges(
					"orchestrator",
					(state: typeof AgentState.State) => {
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
				})
		);
	}
}
