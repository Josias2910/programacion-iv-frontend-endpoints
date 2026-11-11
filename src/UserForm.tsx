import { useState } from "react";
import type { SubmitEvent } from "react";
import { errorMessage } from "./error";

export function UserForm({ token, onUnauthorized, onCreated }: {
  token: string; onUnauthorized: () => void; onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryId, setCountryId] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function guardar(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), age: Number(age), email, password, country_id: Number(countryId) }),
      });
      if (response.status === 401) { onUnauthorized(); return; }
      const data = await response.json();
      if (!response.ok) { setError(errorMessage(data)); return; }
      setMessage("Usuario creado");
      setName(""); setAge(""); setEmail(""); setPassword(""); setCountryId("1");
      onCreated();
    } catch { setError("No se pudo crear el usuario"); }
    finally { setLoading(false); }
  }

  return <section><h2>Alta de usuario</h2>
    <form onSubmit={guardar} className="create-form">
      <label>Nombre<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label>Edad<input type="number" min="0" step="1" required value={age} onChange={(event) => setAge(event.target.value)} /></label>
      <label>Email del usuario<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Contraseña del usuario<input type="password" minLength={4} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <label>País<select value={countryId} onChange={(event) => setCountryId(event.target.value)}><option value="1">Argentina</option><option value="2">Brasil</option></select></label>
      <button disabled={loading}>{loading ? "Guardando..." : "Crear usuario"}</button>
    </form>
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
  </section>;
}
