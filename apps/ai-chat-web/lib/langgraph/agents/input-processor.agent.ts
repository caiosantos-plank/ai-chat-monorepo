import { HumanMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
import type { AudioProcessorClient } from "../../groq";
import type { AgentState } from "./agent.state";

export default class InputProcessorAgent {
	private client: AudioProcessorClient;

	constructor(client: AudioProcessorClient) {
		this.client = client;
	}

	public execute = async (state: typeof AgentState.State) => {
		const lastRecording = state.recordings.at(-1);

		if (!lastRecording) {
			return new Command({
				goto: "orchestrator",
				update: {
					goingTo: "orchestrator",
				},
			});
		}

		const transcription = await this.client.transcribe(lastRecording);
		const newMessage = new HumanMessage(transcription);

		return new Command({
			goto: "orchestrator",
			update: {
				messages: newMessage,
				goingTo: "orchestrator",
			},
		});
	};
}
