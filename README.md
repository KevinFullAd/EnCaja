# EnCaja

> POS offline-first para gastronomía — toma comandas, imprime tickets y administra tu menú desde una sola PC.

EnCaja es un sistema de punto de venta construido como aplicación de escritorio con Electron. Corre completamente offline, guarda todo en SQLite y se conecta a impresoras térmicas por USB o Ethernet. Diseñado para hamburgueserías, cafeterías y rubros similares donde la velocidad en caja es crítica.

---

## Características

- **Toma de comandas** — armá el pedido, confirmá y el ticket sale impreso automáticamente
- **Catálogo flexible** — productos organizados en categorías → familias → sabores → variantes (ej: Clásica / con nachos / Simple o Doble)
- **Impresión térmica** — compatible con impresoras ESC/POS via CUPS (3nStar, Epson, etc.)
- **Panel de administración** — gestioná categorías, productos, precios e imágenes sin tocar código
- **Usuarios y roles** — ADMIN y OPERARIO con login por PIN
- **Auditoría completa** — cada acción queda registrada en el log de eventos
- **Reportes** — ventas por día/semana/mes, productos más vendidos, rendimiento por operario
- **100% offline** — no necesita internet para funcionar

---

## Stack

| Capa | Tecnología |
|---|---|
| Desktop | Electron 29 |
| Frontend | React 19 + Vite + TailwindCSS + Zustand |
| Backend | NestJS 11 + Passport JWT |
| Base de datos | SQLite via Prisma 6 |
| Impresión | ESC/POS + CUPS (`lp`) |

---

## Estructura del proyecto

```
EnCaja/
├── electron/          # Proceso principal de Electron
│   ├── main.js        # Arranque, gestión de ventana y backend
│   └── preload.js     # Bridge contextIsolation
├── apps/
│   ├── backend/       # API REST (NestJS)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── catalogo/   # Productos, familias, variantes
│   │   │   │   ├── comandas/   # Órdenes e impresión
│   │   │   │   ├── usuarios/   # CRUD usuarios
│   │   │   │   ├── reportes/   # Analytics y auditoría
│   │   │   │   ├── eventos/    # Log global de eventos
│   │   │   │   ├── printer/    # Servicio ESC/POS
│   │   │   │   └── sistema/    # Auth JWT + login por PIN
│   │   │   └── infra/prisma/
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       ├── migrations/
│   │       └── data/dev.db     # Base de datos SQLite
│   └── frontend/      # SPA React
│       └── src/
│           ├── pages/          # Login, Items, Admin (Catálogo, Usuarios, Reportes)
│           ├── components/     # UI components
│           ├── store/          # Zustand stores (auth, order, notify)
│           └── lib/api.js      # Cliente HTTP con interceptor 401
└── package.json       # Scripts raíz
```

---

## Instalación y uso

### Requisitos

- Node.js 20–22
- npm 10+
- Linux con CUPS instalado (para impresión)

### Primera vez

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/encaja.git
cd encaja

# Instalar todas las dependencias
npm run setup
```

### Buildear y desplegar

```bash
# Buildear frontend + backend (solo necesario después de cambios en el código)
npm run deploy
```

### Iniciar (arranque rápido del día)

```bash
# Solo aplica migraciones pendientes y abre la app
npm run start
```

### Solo browser (sin Electron)

```bash
# Abre el backend en localhost:3000 y sirve el frontend desde ahí
npm run start:web
```

### Desarrollo

```bash
# Levanta backend con hot reload + Vite dev server + Electron en paralelo
npm run dev
```

---

## Scripts disponibles

| Script | Qué hace |
|---|---|
| `npm run setup` | Instala dependencias de raíz, backend y frontend |
| `npm run build` | Buildea frontend y backend |
| `npm run deploy` | Build + migraciones + abre Electron |
| `npm run start` | Migraciones + abre Electron (sin rebuild) |
| `npm run start:web` | Migraciones + backend en localhost:3000 |
| `npm run dev` | Modo desarrollo con hot reload |
| `npm run migrate` | Aplica migraciones pendientes |

---

## Variables de entorno

El sistema funciona **sin `.env`** — todos los valores tienen defaults hardcodeados para uso local. Si necesitás sobreescribir alguno, creá `apps/backend/.env`:

```env
JWT_SECRET=tu_secret_aqui
JWT_EXPIRES_IN=10h
PRINTER_NAME=POS-80
```

La base de datos siempre vive en `apps/backend/prisma/data/dev.db`.

---

## Impresora térmica

EnCaja usa CUPS para imprimir. Para configurar tu impresora:

1. Instalá los drivers de tu impresora en CUPS
2. Anotá el nombre que le asignó CUPS (ej: `POS-80`, `Epson-TM-T20`)
3. Configuralo en `apps/backend/.env` como `PRINTER_NAME=nombre-de-tu-impresora`

El ticket se formatea a 24 caracteres de ancho con alineación de precios y corte automático ESC/POS.

---

## Roles de usuario

| Rol | Permisos |
|---|---|
| **OPERARIO** | Tomar comandas, ver menú |
| **ADMIN** | Todo lo anterior + gestión de catálogo, usuarios y reportes |

El login es por PIN numérico. El sistema protege al último administrador activo — no se puede eliminar ni cambiar su rol si es el único.

---

## Licencia

MIT