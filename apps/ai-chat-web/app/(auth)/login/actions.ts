"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import AuthService from "@/services/auth.service";

const authService = new AuthService();

export async function signInAction(email: string, password: string) {
	const { error } = await authService.signIn(email, password);

	if (error) {
		return { error };
	}

	revalidatePath("/", "layout");
	redirect("/");
}
