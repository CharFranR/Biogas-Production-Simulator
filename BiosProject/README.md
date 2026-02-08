# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Deploy a GitHub Pages

Se incluye un `Makefile` en la raíz para generar archivos estáticos y publicar en la rama `gh-pages`.

- **Requisitos:** `make`, `git`, `npm` y `npx` (instalados en el entorno).
- **Uso (rápido):**

```sh
make deploy
```

El flujo que hace `make deploy` es:
- Instala dependencias (`npm ci`) y construye la app con rutas relativas (`npm run build -- --base ./`).
- Limpia y copia `dist` a la carpeta `deploy`.
- Publica el contenido de `deploy` en la rama `gh-pages` usando `npx gh-pages`.

Si no dispones de `make`, puedes ejecutar manualmente:

```sh
npm ci
npm run build -- --base ./
rm -rf deploy/*
mkdir -p deploy
cp -r dist/* deploy/
npx gh-pages -d deploy -b gh-pages
```

Si tu entorno Windows no soporta `rm`/`cp`, abre Git Bash o WSL para ejecutar los comandos POSIX anteriores.
