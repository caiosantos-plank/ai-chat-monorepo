import Link from "next/link";
import { Card, CardContent } from "@/shared/components";
import LoginForm from "./_components/login-form";
import { signInAction } from "./actions";

export default async function LoginPage() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-secondary/5 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground mt-2 text-base">
                        Sign in to your account to continue
                    </p>
                </div>

                <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <LoginForm onSubmit={signInAction} loading={false} error={""} />

                        <div className="mt-8 pt-6 border-t border-border/50">
                            <p className="text-center text-muted-foreground text-sm">
                                Don&apos;t have an account?{" "}
                                <Link href="/sign-up">
                                    <button
                                        type="button"
                                        className="cursor-pointer text-secondary hover:text-secondary/80 font-semibold underline underline-offset-4 transition-colors duration-200"
                                    >
                                        Sign up
                                    </button>
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}