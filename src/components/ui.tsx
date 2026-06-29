import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { Icon } from "./Icons";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  variant?: "primary" | "gold" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const variants = {
    primary: "bg-ink text-white hover:bg-gold hover:text-ink",
    gold: "bg-gold text-ink hover:bg-ink hover:text-white",
    dark: "bg-ink text-white hover:bg-black",
    outline: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-white",
    ghost: "text-ink hover:text-gold",
  };
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-[13px]",
    lg: "px-8 py-4 text-sm",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-[0.12em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center,
  light,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && (
        <div className={cn("mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em]", center && "justify-center", light ? "text-gold" : "text-gold")}>
          <span className="h-px w-8 bg-gold" />
          {eyebrow}
          {center && <span className="h-px w-8 bg-gold" />}
        </div>
      )}
      <h2 className={cn("font-display text-3xl font-semibold leading-tight sm:text-4xl", light ? "text-white" : "text-ink")}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 text-[15px] leading-relaxed", light ? "text-white/70" : "text-ink/60")}>{subtitle}</p>
      )}
    </div>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5 text-gold", className)}>
      {[1, 2, 3, 4, 5].map((i) =>
        i <= Math.round(rating) ? (
          <Icon.star key={i} className="h-3.5 w-3.5" />
        ) : (
          <Icon.starOutline key={i} className="h-3.5 w-3.5 text-ash" />
        )
      )}
    </div>
  );
}

export function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  name,
}: {
  label?: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/60">{label}</span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ash focus:border-gold"
      />
    </label>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-block bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white", className)}>
      {children}
    </span>
  );
}
