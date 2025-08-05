import { redirect } from "next/navigation";
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

export async function createChat(name: string) {
	const response = await fetch("/api/chat", {
		method: "POST",
		body: JSON.stringify({ name }),
	});

	const { data, error } = await response.json();

	redirect(`/home/${data.id}`);
}
