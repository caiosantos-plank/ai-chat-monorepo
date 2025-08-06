export async function sendMessage(chatId: string, message: string) {
	const response = await fetch(`/api/chat/${chatId}`, {
		method: "POST",
		body: JSON.stringify({ message }),
	});

	const data = await response.json();
	console.log("sendMessage: data", data);
	return data;
}
