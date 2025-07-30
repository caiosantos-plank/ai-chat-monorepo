"use server";

import AuthService from "@/services/auth.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const authService = new AuthService();

export async function signInAction(email: string, password: string) {
	const { data, error } = await authService.signIn(email, password);

	console.log("data", data);
	console.log("error", error);

	if (error) {
		return { error };
	}

	revalidatePath("/", "layout");
	redirect("/");
}
