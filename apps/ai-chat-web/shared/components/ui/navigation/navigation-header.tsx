
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import UserMenu from "./user-menu";

interface NavigationHeaderProps {
    user: User;
    signOut: () => void;
}

export default function NavigationHeader({ user, signOut }: NavigationHeaderProps) {
    return (
        <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <Link href="/home" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg flex items-center justify-center">
                                <svg fill="#ffffff" viewBox="-2.09 -2.09 34.08 34.08" xmlSpace="preserve" aria-label="Joker Chat" aria-hidden="true">
                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <g>
                                            <g>
                                                <path d="M28.405,14.7c-0.479,0-0.897,0.228-1.172,0.576c-1.56-1.127-4.992-2.994-7.975-0.271c0,0-3.021-4.168-0.982-7.569 c0.246,0.178,0.547,0.286,0.875,0.286c0.827,0,1.5-0.671,1.5-1.5s-0.673-1.5-1.5-1.5c-0.828,0-1.502,0.671-1.502,1.5 c0,0.168,0.032,0.327,0.084,0.478c-2.141,0.819-5.836,2.858-6.39,7.307c0,0-3.429-4.541-8.573-1.594 c-0.265-0.425-0.732-0.711-1.27-0.711c-0.829,0-1.501,0.672-1.501,1.5s0.672,1.5,1.501,1.5c0.828,0,1.499-0.672,1.499-1.5 c0-0.047-0.01-0.091-0.014-0.137c1.794,0.14,4.67,1.726,5.461,10.151l0.09,0.688c0,0.707,2.858,1.279,6.382,1.279 c3.526,0,6.383-0.574,6.383-1.279c0,0,0.229-5.78,5.611-7.623c0.041,0.791,0.688,1.423,1.491,1.423c0.83,0,1.5-0.673,1.5-1.5 C29.907,15.371,29.235,14.7,28.405,14.7z"></path>
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                                {/* <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg> */}
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent">
                                Joker Chat
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">

                    </nav>

                    <UserMenu user={user} signOut={signOut} />
                </div>
            </div>
        </header>
    );
}