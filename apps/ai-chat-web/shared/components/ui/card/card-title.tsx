import type { ReactNode, HTMLAttributes } from "react";

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: ReactNode;
}

export default function CardTitle({ children, className = "", ...props }: CardTitleProps) {
    return (
        <h2 className={`text-xl font-semibold ${className}`} {...props}>{children}</h2>
    )
}   