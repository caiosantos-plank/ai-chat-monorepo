import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export default function Card({ children, className = "", ...props }: CardProps) {
    return (
        <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
            {children}
        </div>
    )
}