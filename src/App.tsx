import { useCallback, useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { UserList } from "./UserList";
import { errorMessage } from "./error";
import type { User } from "./types";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onUnauthorized = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setMe(null);
    setError("Tu sesión venció");
  }, []);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    async function cargarPerfil() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/me/id`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        if (response.status === 401) { onUnauthorized(); return; }
        const data = await response.json();
        if (!response.ok) { setError(errorMessage(data)); return; }
        const detailResponse = await fetch(`${import.meta.env.VITE_API_URL}/user/${data.id}`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        if (detailResponse.status === 401) { onUnauthorized(); return; }
        const user = await detailResponse.json();
        if (!detailResponse.ok) { setError(errorMessage(user)); return; }
        setMe(user);
      } catch {
        if (!controller.signal.aborted) setError("No se pudo cargar el perfil");
      }
    }
    cargarPerfil();
    return () => controller.abort();
  }, [token, onUnauthorized]);

  async function ingresar(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) { setError(errorMessage(data)); return; }
      localStorage.setItem("token", data.token);
      setToken(data.token); setPassword("");
    } catch { setError("No se pudo conectar con la API"); }
    finally { setLoading(false); }
  }

  function salir() {
    localStorage.removeItem("token");
    setToken(null); setMe(null); setError("");
  }

  return <main>
    <h1>Práctica de usuarios</h1>
    {token ? <>
      <header>
        <p>{me ? `Hola, ${me.name} (${me.roles.map((role) => role.name).join(", ") || "Sin roles"})` : "Cargando perfil..."}</p>
        <button onClick={salir}>Cerrar sesión</button>
      </header>
      {error && <p role="alert">{error}</p>}
      <UserList token={token} onUnauthorized={onUnauthorized} />
    </> : <form onSubmit={ingresar} className="login">
      <h2>Ingresar</h2>
      <label>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Contraseña<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <button disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</button>
      {error && <p role="alert">{error}</p>}
    </form>}
  </main>;
}
