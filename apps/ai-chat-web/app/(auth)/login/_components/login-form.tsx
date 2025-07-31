"use client";

import { useState } from "react";
import { Input, Button } from "@/shared/components";

interface LoginFormProps {
    onSubmit: (email: string, password: string) => void;
    loading: boolean;
    error: string;
}

export default function LoginForm({ onSubmit, loading, error }: LoginFormProps) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(email, password);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="transition-all duration-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
            </div>

            <div className="space-y-2">
                <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="transition-all duration-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
            </div>

            {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                loading={loading}
                disabled={!email || !password}
            >
                {loading ? "Signing in..." : "Sign In"}
            </Button>
        </form>
    )
}