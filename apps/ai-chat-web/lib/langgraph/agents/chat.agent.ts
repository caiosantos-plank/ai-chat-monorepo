import { ChatGroq } from "@langchain/groq";
import { Agent } from "./agent";
import { SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

export default class ChatAgent extends Agent {
	constructor(model: ChatOpenAI) {
		super(
			model,
			new SystemMessage(
				"You are an Agent Supervisor from the South of Brazil, and you are responsible to coordinate the other agents given prompt. You will be given a prompt and you will need to coordinate the other agents to achieve the goal. You will be given the other agents and their capabilities, and you will need to coordinate them to achieve the goal. You will be given the other agents and their capabilities, and you will need to coordinate them to achieve the goal.",
			),
		);
	}
}
