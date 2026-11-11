# Respuestas

## Práctica 1

La lista necesita el id y el nombre para mostrar cada fila. El resto de los datos se pide cuando se elige un usuario. Si hubiera 10.000 usuarios, mandar todo junto ocuparía más memoria y más red, aunque después se mirara el detalle de uno solo. También convendría paginar: la API de clase ya limita la lista por defecto a 100 registros.

## Práctica 3

El carácter `#` sin codificar marca un fragmento de la URL, y esa parte no llega al servidor. Con `encodeURIComponent` se convierte en `%23`, así que la búsqueda sí recibe ese carácter. Por eso se codifica lo que escribe el usuario antes de armar la ruta.

## Prácticas 5 y 7

El usuario `sfer` tiene rol REGULAR. La API no le permite crear ni borrar: devuelve `Missing permission: write_users` y `Missing permission: delete_users`, respectivamente. El mensaje se muestra sin cambiar la lista cuando la operación falla.

No parece útil mostrarle una acción que no puede realizar. Más adelante se puede ocultar o deshabilitar según sus permisos. Igual el backend tiene que seguir controlándolos, porque ocultar un botón no alcanza para proteger una API. En esta práctica el botón queda visible para poder comprobar el 403 pedido en la consigna.

## Práctica 9

Contando el código de la aplicación, sin los tests:

- `import.meta.env.VITE_API_URL`: 7 veces, en App, UserList y UserForm.
- `Authorization: Bearer ...`: 6 veces, en esos mismos tres archivos. Login no lleva token.
- Comprobación de `response.ok`: 7 veces, incluyendo `detailResponse.ok`.
- Estados de carga: 4 (`loading` en App, UserList y UserForm, y `loadingDetail`).
- Estados de error: 5 (uno en App, tres en UserList y uno en UserForm).

Si cambia el header del token, hay que modificar tres archivos y seis pedidos. Si se olvida uno, esa parte deja de funcionar aunque las otras sigan bien. Se podría pasar el código repetido de los pedidos a una función común que prepare la URL, el header y los errores. Por ahora se mantuvieron los fetch en los componentes para seguir lo visto hasta el paso 7.
