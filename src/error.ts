export function errorMessage(data: { detail?: unknown }): string {
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => item.msg).join(". ");
  }
  return "No se pudo completar el pedido";
}
