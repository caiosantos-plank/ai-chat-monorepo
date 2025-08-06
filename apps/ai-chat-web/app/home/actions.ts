import AuthService from "@/services/auth.service";

export async function getAuthenticatedUser() {
	const authService = new AuthService();
	const { data, error } = await authService.getAuthenticatedUser();

	if (error) {
		return {
			data: null,
			error,
		};
	}

	return {
		data,
		error: null,
	};
}

export async function sendMessage(message: string) {
	const response = await fetch("/chat/multi-agent", {
		method: "POST",
		body: JSON.stringify({ message }),
	});

	const data = await response.json();

	return data;
}
