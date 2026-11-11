# Práctica de frontend y endpoints

Josías Schumacher - Programación IV.

Resolución de las prácticas 1 a 9 con React, TypeScript y Vite, a partir del ejemplo de clase. El frontend usa la API de usuarios de `clase-1-sqlmodel` de Facundo Fumaneri; no usa el backend del TP de biblioteca ni el TP1 en memoria.

## Ejecutar

Hace falta Node.js 22.12 o superior y Python 3.12 o superior para la API.

Primero, en otra carpeta, levantar el backend de clase:

```bash
git clone https://github.com/ffumaneri/utn-tup-2026-python.git
cd utn-tup-2026-python
git checkout 521513fe4b01e8a0de382619d2d03dbd8f200034
cd clase-1-sqlmodel
python -m venv .venv
```

Activar en PowerShell con `.\.venv\Scripts\Activate.ps1` (en Linux/macOS: `source .venv/bin/activate`). Luego:

```bash
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

En la carpeta de este frontend:

```bash
npm ci
npm run dev
```

Abrir http://localhost:5175. La URL de la API está en `.env` y por defecto es `http://localhost:8000`. Si se cambia, reiniciar Vite. `.env.example` contiene el mismo ejemplo, sin credenciales.

Cuentas de prueba que trae la API docente:
- `mgomez@email.com` / `123`: ADMIN, permite crear y borrar.
- `sfer@email.com` / `123`: REGULAR, permite consultar pero no crear ni borrar.

Estas son cuentas de ejemplo locales. No usar datos ni contraseñas reales. Borrar solamente usuarios creados para probar.

## Qué incluye

1. Detalle por id al hacer clic en un nombre.
2. Estado de carga y mensajes `detail` de la API.
3. Búsqueda por nombre y botón Limpiar.
4. Saludo con el nombre y los roles del usuario conectado.
5. Alta con país, validación de email y contraseña de al menos cuatro caracteres.
6. Alternancia entre todos y mayores.
7. Borrado con confirmación; actualiza el estado con `filter`.
8. Un 401 en un pedido autenticado borra el token y vuelve al login. Un 401 al intentar ingresar muestra el error de credenciales.
9. Respuestas en `respuestas.md`.

## Comprobaciones

```bash
npm run build
npm run lint
npm test
```

Los tests de componentes usan respuestas simuladas. Para revisar manualmente: crear un usuario de 16 años, alternar mayores/todos, abrir su detalle y borrarlo. Con `sfer`, probar alta y borrado para ver los errores de permisos. Para sesión vencida, cambiar el valor de `token` en Local Storage y recargar.

Para ver el mensaje de la práctica 2, cambiar temporalmente el estado inicial `path` de `/user` a `/usr` en `UserList.tsx` y después volverlo a `/user`. Para observar la carga, usar Slow 4G desde Network.

Consigna: https://github.com/marianoggg/utn-tup-2026-frontend-clase/blob/main/TPS/practica-bk-endpoints.pdf
