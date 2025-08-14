import {
	AIMessage,
	HumanMessage,
	RemoveMessage,
} from "@langchain/core/messages";
import type { ChatGroq } from "@langchain/groq";
import { Command, END } from "@langchain/langgraph";
import { v4 as uuid } from "uuid";
import z from "zod";
import type { AgentState } from "./agent.state";

export default class SummarizerAgent {
	constructor(private model: ChatGroq) {}

	public execute = async (state: typeof AgentState.State) => {
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

		console.log("summarizer agent called", response);

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
}
