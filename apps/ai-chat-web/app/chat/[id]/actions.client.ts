import type { Message } from "ai";

export async function sendMessage(chatId: string, messages: Message[]) {
	try {
		const response = await fetch(`/api/chat/${chatId}`, {
			method: "POST",
			body: JSON.stringify({ messages }),
		});

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error sending message", error);
		return null;
	}
}

export const sendAudioMessage = async (
	chatId: string,
	audioRecording: Blob,
	messages: Message[],
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
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			const text = decoder.decode(value, { stream: true });
			console.log("text", text);

			newMessages.push(JSON.parse(text));
		}

		return newMessages;
	} catch (error) {
		console.error("Error sending audio message", error);
		return [];
	}
};
