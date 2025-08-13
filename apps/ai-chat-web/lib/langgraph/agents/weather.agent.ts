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
					agentCalls: {
						...state.agentCalls,
						weather_expert: (state.agentCalls?.weather_expert ?? 0) + 1,
					},
				},
			});
		}

		console.log("weather agent called");

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
}
