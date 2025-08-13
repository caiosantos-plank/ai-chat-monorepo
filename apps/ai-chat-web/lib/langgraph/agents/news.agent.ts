import type { ChatGroq } from "@langchain/groq";
import { Command } from "@langchain/langgraph";
import { searchTools } from "../tools";
import type { AgentState } from "./agent.state";

export default class NewsAgent {
	constructor(private model: ChatGroq) {}

	public execute = async (state: typeof AgentState.State) => {
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
					agentCalls: {
						...state.agentCalls,
						news_expert: (state.agentCalls?.news_expert ?? 0) + 1,
					},
				},
			});
		}

		console.log("news agent called");

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
}
