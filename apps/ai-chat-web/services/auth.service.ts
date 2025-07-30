import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type Response from "@/shared/types/response";

interface AuthServiceInterface {
	signIn(email: string, password: string): Promise<Response<User>>;
	signUp(
		email: string,
		password: string,
		name: string,
	): Promise<Response<User>>;
	getAuthenticatedUser(): Promise<Response<User>>;
	signOut(): Promise<Response<void>>;
}

export default class AuthService implements AuthServiceInterface {
	async signIn(email: string, password: string): Promise<Response<User>> {
		try {
			const supabase = await createClient();

			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				throw new Error(error.message);
			}

			return {
				data: data.user,
				error: null,
			};
		} catch (error) {
			return {
				data: null,
				error:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			};
		}
	}

	async signUp(
		email: string,
		password: string,
		name: string,
	): Promise<Response<User>> {
		try {
			const supabase = await createClient();

			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: name,
					},
				},
			});

			if (error) {
				throw new Error(error.message);
			}

			return {
				data: data.user,
				error: null,
			};
		} catch (error) {
			return {
				data: null,
				error:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			};
		}
	}

	async getAuthenticatedUser(): Promise<Response<User>> {
		try {
			const supabase = await createClient();
			const { data, error } = await supabase.auth.getUser();
			if (error) {
				throw new Error(error.message);
			}

			return {
				data: data.user,
				error: null,
			};
		} catch (error) {
			return {
				data: null,
				error:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			};
		}
	}

	async signOut(): Promise<Response<void>> {
		try {
			const supabase = await createClient();
			const { error } = await supabase.auth.signOut();

			if (error) {
				throw new Error(error.message);
			}

			return {
				data: null,
				error: null,
			};
		} catch (error) {
			return {
				data: null,
				error:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			};
		}
	}
}
