"use server";

import { redirect } from "next/navigation";
import AuthService from "@/services/auth.service";

const authService = new AuthService();

export async function signUpAction(
	email: string,
	password: string,
	name: string,
) {
	const { error } = await authService.signUp(email, password, name);

	if (error) {
		return { error };
	}

	redirect("/sign-up-success");
}
