import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "inverse";

const styles: Record<Variant, string> = {
  primary:
    "bg-ink text-ivory hover:bg-taupe-dark border border-ink",
  secondary:
    "bg-transparent text-ivory border border-ivory/55 hover:bg-ivory/10",
  ghost:
    "bg-transparent text-ink border border-taupe-mid/70 hover:border-taupe-dark hover:bg-beige/50",
  inverse:
    "bg-ivory text-ink border border-ivory hover:bg-beige",
};

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  href?: string;
} & Omit<ComponentProps<"button">, "className">;

export function Button({
  children,
  variant = "primary",
  className,
  href,
  ...props
}: ButtonProps) {
  const classes = clsx(
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-[0.72rem] font-medium tracking-[0.18em] uppercase transition-[transform,background-color,border-color,color,opacity] duration-300 ease-[var(--ease-soft)] will-change-transform hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none",
    styles[variant],
    className
  );

  if (href) {
    const external = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
    if (external) {
      return (
        <a href={href} className={classes} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
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
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
