import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import NavigationHeader from "@/shared/components/ui/navigation/navigation-header";
import { getAuthenticatedUser, signOut } from "./actions";

export default async function HomeLayout({
	children,
}: {
	children: ReactNode;
}) {
	const { data: user } = await getAuthenticatedUser();

	if (!user) {
		redirect("/login");
	}

	return (
		<div className="min-h-screen bg-background">
			<NavigationHeader user={user} signOut={signOut} />
			<main className="flex-1">
				{children}
			</main>
		</div>
	);
}