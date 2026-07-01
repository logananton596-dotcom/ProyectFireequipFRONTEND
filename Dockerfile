# ====== BUILD ======
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Compila los archivos estáticos de Angular
RUN npm run build -- --configuration=production

# ====== RUN ======
FROM nginx:alpine
# Copia el build de Angular a Nginx. Reemplaza 'fireequip-frontend' por el nombre de tu proyecto en angular.json
COPY --from=build /app/dist/fireequip-frontend/browser /usr/share/nginx/html

# Copia una configuración personalizada para evitar errores de rutas (opcional pero muy recomendado)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
