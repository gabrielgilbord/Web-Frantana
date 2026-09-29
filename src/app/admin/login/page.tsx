"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo iniciar sesión");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md border border-line bg-ivory p-8">
      <h1 className="font-display text-4xl">Acceso</h1>
      <p className="mt-2 text-sm text-taupe-dark">
        Panel privado de Frantana. Solo administradores autorizados.
      </p>
      <div className="mt-8 space-y-4">
        <label className="block text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Contraseña
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-line bg-transparent px-3 py-2"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-taupe-dark">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={loading || email.length < 3 || password.length < 8}
          onClick={() => void login()}
          className="inline-flex w-full items-center justify-center bg-ink px-6 py-3 text-[0.72rem] font-medium tracking-[0.18em] uppercase text-ivory disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </div>
    </div>
  );
}
