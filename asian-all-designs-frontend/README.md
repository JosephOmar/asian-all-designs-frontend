# Asian All Designs — Frontend

Tienda construida con Next.js, React, TypeScript y pnpm. El catálogo procede exclusivamente de la API de FastAPI y PostgreSQL.

## Estructura

```text
src/
├─ app/
│  ├─ catalogo/            # Búsqueda, filtros y ordenamiento
│  ├─ producto/[slug]/     # Ficha de producto
│  ├─ carrito/             # Bolsa y solicitud de compra
│  ├─ cuenta/              # Acceso con Google
│  ├─ admin/               # Dashboard exclusivo para administradores
│  ├─ layout.tsx
│  └─ page.tsx             # Inicio
├─ components/             # Componentes visuales y flujos de usuario
├─ lib/                    # Cliente API y tipos
└─ store/                  # Estado persistente del carrito
```

La ficha permite elegir únicamente combinaciones disponibles de color y talla y muestra una galería de hasta tres imágenes con vista ampliada y zoom. El dashboard administra esas variantes e imágenes desde el formulario de producto.

## Configuración local

Requisitos: Node.js 20 o superior y pnpm 10 o superior.

```powershell
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

Abre `http://localhost:3000`.

La variable principal es:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_IMAGE_HOST=aas-images.gtr-and-bi-joseph-mt.win
```

`NEXT_PUBLIC_IMAGE_HOST` debe contener solo el hostname del dominio público conectado al bucket R2, sin `https://` ni rutas. El formulario administrativo carga hasta tres imágenes JPG, PNG o WebP de un máximo de 5 MB directamente en R2.

El dashboard se encuentra en `http://localhost:3000/admin`. El enlace aparece en la cuenta sólo cuando FastAPI devuelve el rol `admin`; además, cada operación vuelve a validar ese rol en el backend.

## Compilación

```powershell
pnpm build
pnpm start
```

Este proyecto puede subirse y desplegarse de manera independiente. La URL pública de FastAPI deberá configurarse en `NEXT_PUBLIC_API_URL` antes de compilar para producción.
