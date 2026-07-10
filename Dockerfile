# ====== STAGE 1: Build ======
FROM node:20.20.2-alpine AS build
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./
RUN npm ci

# Copiar el código fuente y compilar --configuration=production
COPY . .
RUN npm run build --legacy-peer-deps

# ====== STAGE 2: Run ======
FROM node:20.20.2-alpine
WORKDIR /app

# Copiar solo el resultado compilado por Angular 21 desde la etapa de build
# NOTA: Reemplaza 'fireequip-frontend' por el nombre exacto de tu proyecto (míralo en tu angular.json)
COPY --from=build /app/dist/fireequip-manager /app/dist/fireequip-manager

# Exponer el puerto por defecto que usa el servidor SSR de Angular (normalmente el 4000)
EXPOSE 4000

# Comando para iniciar el servidor SSR de tu aplicación
CMD ["node", "dist/fireequip-manager/server/server.mjs"]
