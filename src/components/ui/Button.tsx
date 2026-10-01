import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "solid" | "outline" | "ghost" | "on-dark" | "on-dark-outline" | "ink" | "ink-outline";

const styles: Record<Variant, string> = {
  solid:
    "bg-ivory text-ink border border-ivory hover:bg-ember hover:border-ember",
  outline:
    "bg-transparent text-ivory border border-ivory/35 hover:border-ember hover:text-ember",
  ghost:
    "bg-transparent text-ivory border border-transparent hover:border-ivory/25",
  "on-dark":
    "bg-ivory text-ink border border-ivory hover:bg-ember hover:border-ember",
  "on-dark-outline":
    "bg-transparent text-ivory border border-ivory/55 hover:border-ember hover:text-ember",
  ink: "bg-ink text-mist border border-ink hover:bg-ember hover:border-ember",
  "ink-outline":
    "bg-transparent text-ink border border-ink/25 hover:border-ember hover:text-ember",
};

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  href?: string;
  size?: "sm" | "md";
} & Omit<ComponentProps<"button">, "className">;

export function Button({
  children,
  variant = "solid",
  className,
  href,
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = clsx(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-medium transition-[background-color,border-color,color,transform,opacity] duration-300 ease-[var(--ease-soft)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
    size === "sm"
      ? "min-h-10 px-4 text-[0.68rem] tracking-[0.14em] uppercase"
      : "min-h-11 px-5 text-[0.7rem] tracking-[0.14em] uppercase md:min-h-12 md:px-6",
    styles[variant],
    className
  );

  if (href) {
    const external =
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:");
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          {...(href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
