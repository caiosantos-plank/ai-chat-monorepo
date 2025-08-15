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
					"You are a news expert, and you are responsible to provide the news information.",
					" You cannot answer questions that are not related to the news.",
					" You will be given a task and you need to complete the task.",
					" You have access to the following tools: get_latest_news.",
					" You must extract the term from the user message and use it to search for the news.",
					" Do not include words like 'latest' or 'news' in the search term.",
					" You must avoid call to the same tool twice.",
				].join(""),
			},
			...state.messages,
		]);

		console.log("news agent called");

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

		const fallbackToolCall = {
			id: `call_get_news_${Date.now()}`,
			type: "function",
			function: {
				name: "get_latest_news",
				arguments: JSON.stringify({ query: "latest news" }),
			},
		};

		const toolCall = {
			role: "assistant",
			content: "",
			tool_calls: [fallbackToolCall],
			name: "news_expert",
		};

		return new Command({
			goto: "search_tool",
			update: {
				messages: toolCall,
				goingTo: "search_tool",
				agentCalls: {
					...state.agentCalls,
					news_expert: (state.agentCalls?.news_expert ?? 0) + 1,
				},
			},
		});
	};
}
