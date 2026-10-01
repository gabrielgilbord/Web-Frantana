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
    <div className="admin-login">
      <div className="admin-login__card">
        <p className="admin-login__brand">FRANTANA</p>
        <h1 className="admin-login__title">Acceso</h1>
        <p className="admin-login__lede">
          Panel privado. Solo administradores autorizados.
        </p>

        <form
          className="admin-login__form"
          onSubmit={(e) => {
            e.preventDefault();
            void login();
          }}
        >
          <label className="admin-field">
            <span className="admin-field__label">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-field__input admin-field__input--lg"
            />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Contraseña</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-field__input admin-field__input--lg"
            />
          </label>
          {error && (
            <p role="alert" className="admin-feedback admin-feedback--error">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || email.length < 3 || password.length < 8}
            className="admin-btn admin-btn--primary admin-btn--block"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
