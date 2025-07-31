import type { ReactNode, HTMLAttributes } from "react";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export default function CardHeader({ children, className = "", ...props }: CardHeaderProps) {
    return (
        <div className={`p-6 border-b ${className}`} {...props}>
            {children}
        </div>
    )
}