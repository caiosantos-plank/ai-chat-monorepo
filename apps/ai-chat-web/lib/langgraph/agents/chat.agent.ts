import type { ChatGroq } from "@langchain/groq";
import { Command, END } from "@langchain/langgraph";
import z from "zod";
import type { AgentState } from "./agent.state";

export default class ChatAgent {
	constructor(private model: ChatGroq) {}

	public execute = async (state: typeof AgentState.State) => {
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

		console.log("chat agent called");

		return new Command({
			goto: state.messages.length >= 6 ? "summarizer_agent" : END,
			update: {
				messages: aiMessage,
				goingTo: state.messages.length >= 6 ? "summarizer_agent" : END,
			},
		});
	};
}
