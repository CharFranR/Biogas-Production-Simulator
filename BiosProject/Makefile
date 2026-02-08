# Makefile para build y deploy a GitHub Pages
# Requisitos: `make`, `git` y `npm` instalados. Se usa `npx gh-pages` para publicar.

.PHONY: build prepare publish deploy clean

build:
	@echo "Construyendo con base relativa..."
	@echo Nota: por seguridad make no ejecuta npm ci automáticamente.
	@echo Si quieres forzar la reinstalación de dependencias, ejecuta: make ci
	@npm run build -- --base ./

prepare:
	@echo "Preparando carpeta deploy..."
	@node scripts/prepare-deploy.cjs

publish: build prepare
	@echo "Publicando carpeta deploy a la rama gh-pages..."
	@npx gh-pages -d deploy -b gh-pages

ci:
	@echo "Instalando dependencias (npm ci)..."
	@npm ci || npm install

deploy: publish
	@echo "Deploy completo."

clean:
	@echo "Limpiando artefactos..."
	@rm -rf dist
	@rm -rf deploy/* || true
