"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="text-[0.7rem] uppercase tracking-[0.16em] underline"
      onClick={async () => {
        await fetch("/api/auth/login", { method: "DELETE" });
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Salir
    </button>
  );
}
