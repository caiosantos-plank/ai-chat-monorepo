"use client";

import Link from "next/link";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/shared/components";

interface UserMenuProps {
    user: User;
    signOut: () => void;
}

export default function UserMenu({ user, signOut }: UserMenuProps) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const getUserInitials = (name?: string, email?: string) => {
        if (name) {
            return name
                .split(" ")
                .map(n => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        if (email) {
            return email[0].toUpperCase();
        }
        return "U";
    };

    const getUserDisplayName = () => {
        if (user?.user_metadata?.full_name) {
            return user.user_metadata.full_name;
        }
        return user?.email || "User";
    };

    return (
        <div className="flex items-center space-x-4">
            {user ? (
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors duration-200"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {getUserInitials(user.user_metadata?.full_name, user.email || undefined)}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-foreground">
                                {getUserDisplayName()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {user.email || "No email"}
                            </p>
                        </div>
                        <svg
                            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                            <div className="px-4 py-3 border-b border-border/50">
                                <p className="text-sm font-medium text-foreground">
                                    {getUserDisplayName()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {user.email || "No email"}
                                </p>
                            </div>
                            <div className="py-1">
                                <Link
                                    href="/profile"
                                    className="block px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-accent transition-colors duration-200"
                                    onClick={() => setIsUserMenuOpen(false)}
                                >
                                    Profile Settings
                                </Link>
                                <Link
                                    href="/settings"
                                    className="block px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-accent transition-colors duration-200"
                                    onClick={() => setIsUserMenuOpen(false)}
                                >
                                    Account Settings
                                </Link>
                                <hr className="my-1 border-border/50" />
                                <button
                                    type="button"
                                    onClick={signOut}
                                    className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors duration-200"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center space-x-2">
                    <Link href="/login">
                        <Button variant="ghost" size="sm">
                            Sign In
                        </Button>
                    </Link>
                    <Link href="/sign-up">
                        <Button size="sm">
                            Sign Up
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}