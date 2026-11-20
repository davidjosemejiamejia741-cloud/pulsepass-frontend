# PulsePass Web — Fase 5 (Frontend)

SPA de PulsePass construida según `PRD_PulsePass_Frontend_React_TypeScript_Tailwind.pdf` y las guías de
`FRONTEND/` (React + TypeScript, rutas con React Router v8, CSS/Tailwind).

Catálogo público, registro e inicio de sesión, compra y gestión de tickets propios (USER), validación de
ingreso (STAFF/ADMIN) y administración de eventos (ADMIN). El frontend **presenta y orquesta; no decide**:
edad mínima, capacidad, estados, propiedad y permisos los valida siempre el backend.

## Stack

| Área | Elección |
|---|---|
| Runtime | Node 22.22+ |
| UI | React 19 + TypeScript 6.0 (`strict`, `noUncheckedIndexedAccess`) |
| Build | Vite (plantilla `react-ts`) |
| Estilos | Tailwind CSS v4 (`@tailwindcss/vite`, tokens en `@theme` de `src/index.css`) |
| Rutas | `react-router` v8: `createBrowserRouter` + `RouterProvider` (`react-router/dom`), páginas `lazy` |
| Estado de servidor | TanStack Query |
| Formularios | React Hook Form + zod (`zodResolver`) |
| HTTP | `fetch` nativo encapsulado en `src/lib/http.ts` (`ApiError`) |
| Pruebas | Vitest + Testing Library + MSW |
| Calidad | ESLint 9 (`typescript-eslint` con tipos, `react-hooks`, `jsx-a11y`), Prettier + `prettier-plugin-tailwindcss` |

> **Versiones fijadas a propósito:**
> - **TypeScript 6.0**: la plantilla de Vite instala TypeScript 7, pero `typescript-eslint` aún no lo admite.
> - **ESLint 9**: `eslint-plugin-jsx-a11y` (accesibilidad, NFR-FE-001) aún no admite ESLint 10.
>
> Al subir versiones, actualiza primero esos plugins.

### Reglas de lint propias del PRD

`eslint.config.js` convierte en error las prohibiciones de la sección 16, además de las reglas recomendadas:

| Prohibición del PRD | Regla |
|---|---|
| `react-router-dom`, Axios | `no-restricted-imports` |
| `React.FC` / `FC` | `no-restricted-properties`, `no-restricted-syntax` |
| `any` | `@typescript-eslint/no-explicit-any` |
| `enum` de TypeScript | `no-restricted-syntax` (`TSEnumDeclaration`) |
| Token en `localStorage` o cookies | `no-restricted-globals`, `no-restricted-properties` |
| `dangerouslySetInnerHTML` | `no-restricted-syntax` |
| Clases Tailwind dinámicas (`bg-${x}-500`) | `no-restricted-syntax` sobre `className` |
| Tokens o respuestas en consola | `no-console` (solo se permite `console.error`) |

Excepciones documentadas en el propio código: `useTema.ts` usa `localStorage` solo para la preferencia de tema
(no el token) y `ValidacionIngreso.tsx` usa `autoFocus` porque el PRD (9.14) exige foco automático.

## Puesta en marcha

```bash
npm install
cp .env.example .env        # opcional: VITE_API_BASE_URL=/api
npm run dev                 # http://localhost:5173  (proxy /api -> http://localhost:8080)
```

El backend (Fases 1–4, `BACKEND/pulsepass-persistencia`) debe estar corriendo en `http://localhost:8080`.
En desarrollo el proxy de Vite evita CORS (GAP-05). Para otro destino: `PULSEPASS_API_URL=http://host:puerto npm run dev`.

### Modo demostración sin backend

```bash
npm run dev:mock
```

Arranca la app con **MSW en el navegador**, que simula los 23 endpoints con el escenario de la sección 22
del PRD. Los datos viven en memoria (una recarga restablece compras y cambios).

| Usuario | Rol | Notas |
|---|---|---|
| `andrea` | USER | Adulta; tiene `TKT-8F2A1C` (VIP, PAID) |
| `carlos` | USER | Tiene `TKT-91B07D` (GENERAL, PAID) |
| `laura` | USER | 17 años: la compra de `CMF-2026` se rechaza con 409 por edad |
| `miguel` | USER | Inactivo: el login responde 401 |
| `staff` | STAFF | Validación de ingreso y tickets pagados |
| `admin` | ADMIN | Crear/publicar eventos (`BOR-2027` está en DRAFT) |

Contraseña de todos los usuarios de demostración: la constante `CLAVE_DEMO` de `src/test/mocks/datos.ts`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con proxy a la API |
| `npm run dev:mock` | Servidor de desarrollo con API simulada (MSW) |
| `npm run build` | `tsc -b` estricto + build de producción |
| `npm run lint` | ESLint (`eslint .`) |
| `npm test` | Pruebas (Vitest + Testing Library + MSW) |
| `npm run format` | Prettier con orden de clases Tailwind |

## Rutas

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Inicio | Público |
| `/eventos` (`?q=&categoria=&artista=`) | CatalogoEventos | Público |
| `/eventos/:eventCode` | DetalleEvento (compra: USER) | Público |
| `/artistas`, `/artistas/:id` | ListaArtistas, DetalleArtista | Público |
| `/sedes`, `/sedes/:code` | ListaSedes, DetalleSede | Público |
| `/login`, `/registro` | Login, Registro | Solo anónimo |
| `/cuenta` | Cuenta | Autenticado |
| `/mis-tickets`, `/mis-tickets/:ticketCode` | MisTickets, DetalleTicket | USER |
| `/compra/confirmacion/:ticketCode` | ConfirmacionCompra | USER |
| `/staff/validacion` | ValidacionIngreso | STAFF, ADMIN |
| `/staff/eventos/:eventCode/tickets` | TicketsPagadosEvento | STAFF, ADMIN |
| `/admin/eventos`, `/admin/eventos/nuevo`, `/admin/eventos/:eventCode` | AdminEventos, AdminCrearEvento, AdminGestionEvento | ADMIN |
| `/403`, `*` | SinPermisos, NoEncontrada | Público |

`/staff/eventos` (sin código) muestra solo el selector de evento; es el destino del enlace
"Tickets pagados" de la navbar, que no tiene un evento por defecto.

## Estructura

```
src/
  main.tsx            QueryClientProvider > AuthProvider > RouterProvider
  router.tsx          árbol de rutas (lazy, guardas, errorElement)
  index.css           @import "tailwindcss" + @theme (marca, acento, Poppins/Inter)
  lib/                http.ts (ApiError), rutas.ts (RUTAS), formato.ts, queryClient.ts, errores.ts
  layouts/            Layout, Navbar, RutaProtegida, RutaPorRol, SoloAnonimo
  componentes/        Boton, Campo/Selector/AreaTexto, Badge, Tarjeta, Modal, Tabla<T>, Avisos, Estados, Iconos
  funcionalidades/    auth, eventos, artistas, sedes, usuarios, tickets, admin  { api.ts tipos.ts hooks.ts componentes/ }
  pages/              una página por ruta
  test/               setup.ts, utils.tsx, mocks/ (handlers MSW de los 23 endpoints)
diseno/               capturas de diseño del PRD (referencia visual)
```

## Decisiones y supuestos

- **Contratos tomados del backend real** (`BACKEND/pulsepass-persistencia`, DTO y `SecurityConfig`).
  `GET /api/auth/me` devuelve roles como autoridades de Spring (`ROLE_USER`); el cliente los normaliza a
  `USER | STAFF | ADMIN`. Los permisos nunca se leen del JWT.
- **Sesión**: token en memoria + `sessionStorage` (nunca `localStorage` ni cookies), validado con zod al
  arrancar y descartado si expiró. Cierre automático al vencer `expiresIn`; cualquier 401 con sesión cierra
  la sesión, limpia la caché y lleva a `/login` con el aviso "Tu sesión expiró".
- **Compra**: el `userEmail` sale siempre de la sesión (anti-IDOR); el precio lo fija el backend.
- **Panel ADMIN** (GAP-01): sin listado completo de eventos; búsqueda por código y lista "Creados en esta
  sesión" en `sessionStorage` (se pierde al cerrar la pestaña).
- **Descripción del evento**: límite de 500 caracteres en la UI (diseño 9.17); el backend admite 5000.
- **Fortaleza de contraseña**: indicador orientativo (longitud y variedad); la única regla real es la del
  backend (≥ 12 caracteres y ≤ 72 bytes UTF-8).
- **Titular** en vistas STAFF: `TicketResponse` solo trae `userEmail`, así que se muestra el correo (STAFF no
  puede consultar perfiles ajenos). En "Detalle de ticket" se muestra el nombre del propio usuario.
- **Modo oscuro**: clase `.dark` en `<html>`; el valor inicial respeta `prefers-color-scheme` y el botón de la
  navbar lo alterna (la preferencia visual sí se guarda en `localStorage`; no es un dato sensible).
