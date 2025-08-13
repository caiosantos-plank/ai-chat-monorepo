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
		console.log("input processor agent", state);
		const lastRecording = state.recordings.at(-1);

		console.log("lastRecording", lastRecording);

		if (!lastRecording) {
			return new Command({
				goto: "orchestrator",
				update: {
					goingTo: "orchestrator",
				},
			});
		}

		const transcription = await this.client.transcribe(lastRecording);
		console.log("transcription", transcription);

		const newMessage = new HumanMessage(transcription);

		console.log("newMessage", newMessage);

		return new Command({
			goto: "orchestrator",
			update: {
				messages: newMessage,
				goingTo: "orchestrator",
			},
		});
	};
}
