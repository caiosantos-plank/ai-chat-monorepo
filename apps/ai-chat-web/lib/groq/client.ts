import { Groq } from "groq-sdk";

export default class AudioProcessorClient {
	private client: Groq;

	constructor() {
		this.client = new Groq({
			apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
		});
	}

	public async transcribe(recordingBlob: File): Promise<string> {
		const transcription = await this.client.audio.transcriptions.create({
			model: "whisper-large-v3-turbo",
			file: recordingBlob,
			language: "en",
			response_format: "verbose_json",
			timestamp_granularities: ["word", "segment"],
			temperature: 0.0,
			prompt: "You are a helpful assistant that transcribes audio into text.",
		});

		console.log("transcription", transcription);

		return transcription.text;
	}
}
