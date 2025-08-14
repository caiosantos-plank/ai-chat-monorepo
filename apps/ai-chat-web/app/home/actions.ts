"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import AuthService from "@/services/auth.service";
import ChatService from "@/services/chat.service";

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

export async function signOut() {
	const authService = new AuthService();
	await authService.signOut();
	redirect("/login");
}

export async function createChat() {
	const service = new ChatService();
	const { data, error } = await service.createChat({ name: "New Chat" });

	if (!error && data) {
		redirect(`/chat/${data.id}`);
	}
}

export async function getChats() {
	const service = new ChatService();
	const { data, error } = await service.getChats();

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

export async function deleteChat(
	chatId: string,
	shouldRedirect: boolean = true,
) {
	const service = new ChatService();
	const { error } = await service.deleteChat(chatId);

	if (shouldRedirect && !error) {
		console.log("revalidating");
		revalidatePath("/home", "layout");
	}
}
