import type { ChatGroq } from "@langchain/groq";
import { Command } from "@langchain/langgraph";
import { weatherTools } from "../tools";
import type { AgentState } from "./agent.state";

export default class WeatherAgent {
	private model: ChatGroq;

	constructor(model: ChatGroq) {
		this.model = model;
	}

	public execute = async (state: typeof AgentState.State) => {
		const modelWithTools = this.model.bindTools(weatherTools);

		const response = await modelWithTools.invoke([
			{
				role: "system",
				content: [
					// "You are a weather expert, and you are responsible to provide the weather information.",
					// " You cannot answer questions that are not related to the weather.",
					// " You have access to the following tools: get_weather.",
					// " You must send just the location to the get_weather tool, do not include any other text.",
					// " Do not include words like city, country, state, etc. Just the location name.",
					// " You must avoid call to the same tool twice.",
					"You are a weather expert. Your sole purpose is to provide weather information.",
					"You must always call the get_weather tool exactly once for weather-related questions.",
					"From the user's message, identify and extract the exact location name (e.g., “Paris”, “São Paulo”, “Tokyo”).",

					"Do not add extra words like “city”, “state”, or “country” unless they are explicitly part of the location itself.",
					"If you cannot determine the location, use Belo Horizonte as the default.",

					"You must send just the location to the get_weather tool, do not include any other text.",
					"If the question is not about weather, reply with: 'I can only provide weather information.' and do not call any tool.",
					"Output only the tool call in this exact JSON format, with no extra text: { 'name': 'get_weather', 'arguments': { 'location': '<LOCATION>' } }",
				].join(" "),
			},
			...state.messages,
		]);

		console.log("weather agent called", response);

		if (response.tool_calls && response.tool_calls.length > 0) {
			return new Command({
				goto: "weather_tool",
				update: {
					...state.agentCalls,
					messages: response,
					goingTo: "weather_tool",
					agentCalls: {
						...state.agentCalls,
						weather_expert: (state.agentCalls?.weather_expert ?? 0) + 1,
					},
				},
			});
		}

		const fallbackToolCall = {
			id: `call_get_weather_${Date.now()}`,
			type: "function",
			function: {
				name: "get_weather",
				arguments: JSON.stringify({
					location: "Belo Horizonte",
				}),
			},
		};
		const toolCall = {
			role: "assistant",
			content: "",
			tool_calls: [fallbackToolCall],
			name: "weather_expert",
		};
		return new Command({
			goto: "weather_tool",
			update: {
				messages: toolCall,
				goingTo: "weather_tool",
				agentCalls: {
					...state.agentCalls,
					weather_expert: (state.agentCalls?.weather_expert ?? 0) + 1,
				},
			},
		});
	};
}
