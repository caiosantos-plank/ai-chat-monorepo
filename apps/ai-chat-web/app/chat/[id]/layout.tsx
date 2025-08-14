import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getAuthenticatedUser, signOut } from "@/app/home/actions";
import NavigationHeader from "@/shared/components/ui/navigation/navigation-header";

export default async function ChatLayout({
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