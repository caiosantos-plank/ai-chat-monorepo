import type { ReactNode, HTMLAttributes } from "react";

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export default function CardContent({ children, className = "", ...props }: CardContentProps) {
    return (
        <div className={`p-6 ${className}`} {...props}>
            {children}
        </div>
    )
} 