import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import UserMenu from "./user-menu";

interface NavigationHeaderProps {
    user: User;
}

export default function NavigationHeader({ user }: NavigationHeaderProps) {
    return (
        <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <Link href="/home" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent">
                                AI Chat
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/home"
                            className="text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium"
                        >
                            Home
                        </Link>
                        <Link
                            href="/chats"
                            className="text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium"
                        >
                            Chats
                        </Link>
                        <Link
                            href="/settings"
                            className="text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium"
                        >
                            Settings
                        </Link>
                    </nav>

                    <UserMenu user={user} />
                </div>
            </div>
        </header>
    );
}