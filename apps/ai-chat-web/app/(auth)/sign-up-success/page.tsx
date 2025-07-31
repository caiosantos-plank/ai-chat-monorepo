

export default function SignUpSuccessPage() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-secondary/5 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent">
                        Confirm your email
                    </h1>
                    <p className="text-muted-foreground mt-2 text-base">
                        We&apos;ve sent you an email to confirm your account.
                    </p>
                </div>
            </div>
        </div>
    );
}