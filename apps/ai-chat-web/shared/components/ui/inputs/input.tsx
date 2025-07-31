import type { InputHTMLAttributes } from "react";
import { useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({ label, error, className = "", id, ...props }: InputProps) {
    const inputId = useId();
    const finalId = id || inputId;
    
    return (
        <div className="space-y-2">
            {label && (
                <label htmlFor={finalId} className="text-sm font-medium text-foreground">
                    {label}
                </label>
            )}
            <input
                id={finalId}
                className={`w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
                    error ? "border-destructive" : ""
                } ${className}`}
                {...props}
            />
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
} 