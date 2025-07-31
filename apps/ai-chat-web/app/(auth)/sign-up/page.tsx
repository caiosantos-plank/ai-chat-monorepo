
import Link from "next/link";
import { Card, CardContent } from "@/shared/components";
import SignUpForm from "./_components/sign-up-form";
import { signUpAction } from "./actions";

export default async function SignUpPage() {
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="text-muted-foreground mt-2 text-base">
                        Join us and start your journey today
                    </p>
                </div>

                <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <SignUpForm onSubmit={signUpAction} loading={false} error={""} />

                        <div className="mt-8 pt-6 border-t border-border/50">
                            <p className="text-center text-muted-foreground text-sm">
                                Already have an account?{" "}
                                <Link href="/login">
                                    <button
                                        type="button"
                                        className="cursor-pointer text-secondary hover:text-secondary/80 font-semibold underline underline-offset-4 transition-colors duration-200"
                                    >
                                        Sign in
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