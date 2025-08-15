import type { Message } from "ai";

export async function sendMessage(
	chatId: string,
	messages: Message[],
	callback: (message: string) => void,
) {
	try {
		const response = await fetch(`/api/chat/${chatId}`, {
			method: "POST",
			body: JSON.stringify({ messages }),
		});

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();

		if (!reader) throw new Error("No reader");

		const newMessages = [];
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			const text = decoder.decode(value, { stream: true });

			callback(JSON.parse(text).content);

			newMessages.push(JSON.parse(text));
		}

		return newMessages.at(-1);
	} catch (error) {
		console.error("Error sending message", error);
		return null;
	}
}

export const sendAudioMessage = async (
	chatId: string,
	audioRecording: Blob,
	messages: Message[],
	callback: (message: string) => void,
) => {
	try {
		const formData = new FormData();

		const audioFile = new File([audioRecording], "audio.wav", {
			type: "audio/wav",
		});

		formData.append("audio", audioFile);
		formData.append("messages", JSON.stringify(messages));

		const response = await fetch(`/api/chat/${chatId}?isAudio=true`, {
			method: "POST",
			body: formData,
		});

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();

		if (!reader) throw new Error("No reader");

		const newMessages = [];
		let userMessage = "";
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			const text = decoder.decode(value, { stream: true });
			console.log("text", text);

			const parsedText = JSON.parse(text);
			if (parsedText.role === "user") {
				userMessage = parsedText;
			}

			newMessages.push(JSON.parse(text));
			callback(parsedText.content);
		}

		// We must return only the last message, which is the message from agent and also the user message
		console.log("newMessages", newMessages.at(-1), userMessage);
		return [userMessage, newMessages.at(-1)];
	} catch (error) {
		console.error("Error sending audio message", error);
		return [];
	}
};
