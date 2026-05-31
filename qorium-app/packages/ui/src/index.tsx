import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className={[
        "inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-900 bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50",
        props.className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
