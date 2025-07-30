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
