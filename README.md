# Frontend Angular - Devoluciones y Garantias

Frontend Angular para la App de Gestion de Devoluciones y Garantias.

## Requisitos

- Node.js compatible con Angular 20.
- npm.
- Backend .NET levantado en `http://localhost:5000`.

## Configuracion

La URL de la API esta en:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`

Valor local:

```ts
apiBaseUrl: 'http://localhost:5000/api'
```

No hay secretos en Angular. El frontend consume la API .NET y nunca usa `Supabase:ServiceRoleKey`.

## Comandos

```powershell
npm install
npm start
npm run build
```

La app queda disponible normalmente en:

- `http://localhost:4200`

## Roles y rutas

Publica:

- `/login`

Cliente:

- `/cliente/pedidos`
- `/cliente/pedidos/:orderId/productos`
- `/cliente/solicitudes`
- `/cliente/solicitudes/nueva`
- `/cliente/solicitudes/:id`

Administrador / Analista:

- `/admin/dashboard`
- `/admin/solicitudes`
- `/admin/solicitudes/:id`
- `/reportes`

Proveedor:

- `/proveedor/casos`
- `/proveedor/casos/:id`

## Seguridad frontend

- `auth-token.interceptor` agrega Bearer solo si hay token.
- `error.interceptor` limpia sesion ante 401.
- `role.guard` bloquea rutas fuera del rol y muestra mensaje de permisos.
- No hay usuarios, tokens ni credenciales hardcodeadas como flujo principal.

## Flujos conectados

- Auth: login, logout, usuario actual.
- Cliente: pedidos, productos, elegibilidad, solicitudes, detalle, timeline y evidencias.
- Admin/Analista: dashboard operativo, bandeja, detalle, comentarios, informacion adicional, aprobar/rechazar y reportes.
- Proveedor: casos asignados, detalle, garantia, dictamen, autorizaciones y recepcion.
- Reportes: generacion y descarga CSV/PDF.

## Referencia visual Blazor

La paridad visual se tomo desde `Sistema-de-Devoluciones-FrontEnd/`.

Archivos de referencia revisados:

- `Components/Layout/DashboardLayout.razor`
- `Components/Layout/MainLayout.razor`
- `Components/Pages/MisPedidos.razor`
- `Components/Pages/DetalleSolicitud.razor`
- `Components/Pages/DashboardAdmin.razor`
- `Components/Pages/ProveedorDashboard.razor`
- `wwwroot/app.css`

Estilos migrados a Angular:

- Paleta `slate`, azul primario y verde proveedor.
- Sidebar privado con tarjeta de usuario, marca GarantiaPro y navegacion por rol.
- Cards amplias con bordes redondeados, tablas densas, badges tipo pill, formularios y estados vacios.
- Layout privado con topbar sticky, contenedor ancho y espaciados tipo dashboard.

Assets copiados:

- `src/assets/images/blazor-favicon.png`

El login Angular fue excluido intencionalmente de esta paridad visual para conservar su apariencia y funcionamiento previo.

## Notas de QA

- Los usuarios demo provienen del seed del backend en Development.
- El texto de ayuda del login menciona credenciales demo, pero no incluye contrasenas ni tokens.
- La app no consulta Supabase directamente.
