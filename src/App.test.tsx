// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";

const admin = { id: 1, name: "Martina", email: "mgomez@email.com", age: 28, country: { id: 1, name: "Argentina" }, roles: [{ id: 1, name: "ADMIN" }] };
let users: { id: number; name: string; age: number }[];
let calls: { url: string; options?: RequestInit }[];
let fail: { path: string; method?: string; status: number; detail: string } | null;
const answer = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  localStorage.clear(); localStorage.setItem("token", "test-token");
  users = [{ id: 1, name: "Martina", age: 28 }, { id: 2, name: "Santiago", age: 34 }];
  calls = []; fail = null;
  vi.stubGlobal("fetch", vi.fn(async (url: string, options?: RequestInit) => {
    calls.push({ url, options });
    const path = new URL(url).pathname;
    if (fail && path === fail.path && (options?.method || "GET") === (fail.method || "GET")) return answer({ detail: fail.detail }, fail.status);
    if (path === "/login") return answer({ token: "new-token" });
    if (path === "/user/me/id") return answer({ id: 1 });
    if (path === "/user" && options?.method === "POST") {
      const body = JSON.parse(String(options.body)); users.push({ id: 3, ...body }); return answer({ id: 3 });
    }
    if (options?.method === "DELETE") return answer({ msg: "ok" });
    if (path === "/user") return answer(users.map(({ id, name }) => ({ id, name })));
    if (path === "/user_mayores") return answer(users.filter((user) => user.age >= 18));
    if (path.startsWith("/user/search/")) return answer(users.filter((user) => user.name.toLowerCase().includes(decodeURIComponent(path.split("/").pop()!).toLowerCase())));
    if (path === "/user/1") return answer(admin);
    if (path === "/user/2") return answer({ ...admin, id: 2, name: "Santiago", age: 34 });
    return answer({ detail: "Not Found" }, 404);
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

async function ready() {
  render(<App />);
  await screen.findByText("Hola, Martina (ADMIN)");
  await screen.findByRole("button", { name: "Santiago" });
}

test("lista, saludo con roles y detalle al elegir usuario", async () => {
  await ready();
  fireEvent.click(screen.getByRole("button", { name: "Santiago" }));
  expect(await screen.findByText("Edad: 34")).toBeTruthy();
  expect(screen.getByText("País: Argentina")).toBeTruthy();
  expect(screen.getByText("Roles: ADMIN")).toBeTruthy();
});

test("cargando y error detail en lugar de lista", async () => {
  fail = { path: "/user", status: 404, detail: "Not Found" };
  render(<App />);
  expect(screen.getByText("Cargando...")).toBeTruthy();
  expect(await screen.findByText("Not Found")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Santiago" })).toBeNull();
});

test("busca con encodeURIComponent y limpia", async () => {
  await ready();
  fireEvent.change(screen.getByLabelText("Buscar por nombre"), { target: { value: "#" } });
  fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
  await screen.findByText("No se encontraron usuarios.");
  expect(calls.some(({ url }) => url.endsWith("/user/search/%23"))).toBe(true);
  fireEvent.click(screen.getByText("Limpiar"));
  expect(await screen.findByRole("button", { name: "Santiago" })).toBeTruthy();
});

test("alta con números, refresco y filtro de mayores", async () => {
  await ready();
  fireEvent.change(screen.getByLabelText("Nombre", { exact: true }), { target: { value: "Prueba" } });
  fireEvent.change(screen.getByLabelText("Edad"), { target: { value: "16" } });
  fireEvent.change(screen.getByLabelText("Email del usuario"), { target: { value: "prueba@example.com" } });
  fireEvent.change(screen.getByLabelText("Contraseña del usuario"), { target: { value: "abcd" } });
  fireEvent.click(screen.getByText("Crear usuario"));
  await screen.findByRole("button", { name: "Prueba" });
  const body = JSON.parse(String(calls.find(({ options }) => options?.method === "POST")!.options!.body));
  expect(body.age).toBe(16); expect(body.country_id).toBe(1);
  fireEvent.click(screen.getByText("Solo mayores"));
  await screen.findByText("Vista: Solo mayores");
  await waitFor(() => expect(screen.queryByRole("button", { name: "Prueba" })).toBeNull());
  fireEvent.click(screen.getByText("Mostrar todos"));
  expect(await screen.findByRole("button", { name: "Prueba" })).toBeTruthy();
});

test("borrar requiere confirmación y no vuelve a pedir lista", async () => {
  await ready();
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  const row = screen.getByRole("button", { name: "Santiago" }).closest("li")!;
  fireEvent.click(within(row).getByText("Borrar"));
  expect(calls.filter(({ options }) => options?.method === "DELETE")).toHaveLength(0);
  confirm.mockReturnValue(true);
  const listsBefore = calls.filter(({ url }) => url.endsWith("/user")).length;
  fireEvent.click(within(row).getByText("Borrar"));
  await waitFor(() => expect(screen.queryByRole("button", { name: "Santiago" })).toBeNull());
  expect(calls.filter(({ url }) => url.endsWith("/user"))).toHaveLength(listsBefore);
});

test("403 al borrar muestra detalle y conserva usuario", async () => {
  await ready();
  fail = { path: "/user/2", method: "DELETE", status: 403, detail: "Missing permission: delete_users" };
  vi.spyOn(window, "confirm").mockReturnValue(true);
  fireEvent.click(within(screen.getByRole("button", { name: "Santiago" }).closest("li")!).getByText("Borrar"));
  expect(await screen.findByText("Missing permission: delete_users")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Santiago" })).toBeTruthy();
});

test("401 elimina token y muestra login", async () => {
  fail = { path: "/user", status: 401, detail: "Invalid token" };
  render(<App />);
  expect(await screen.findByText("Tu sesión venció")).toBeTruthy();
  expect(localStorage.getItem("token")).toBeNull();
  expect(screen.getByLabelText("Contraseña", { exact: true })).toBeTruthy();
});

test("iniciar y cerrar sesión", async () => {
  localStorage.clear(); render(<App />);
  fireEvent.change(screen.getByLabelText("Email", { exact: true }), { target: { value: "mgomez@email.com" } });
  fireEvent.change(screen.getByLabelText("Contraseña", { exact: true }), { target: { value: "123" } });
  fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
  await screen.findByText("Hola, Martina (ADMIN)");
  expect(localStorage.getItem("token")).toBe("new-token");
  fireEvent.click(screen.getByText("Cerrar sesión"));
  expect(localStorage.getItem("token")).toBeNull();
});
