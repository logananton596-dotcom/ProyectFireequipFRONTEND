# ====== STAGE 1: Build ======
FROM node:20.20.2-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration=production

# ====== STAGE 2: Run con Nginx ======
FROM nginx:alpine

# Limpia Nginx y copia la compilación estática exacta de Angular
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/fireequip-manager/browser /usr/share/nginx/html

# Configura Nginx en el puerto 4000 con soporte para rutas de Angular
RUN printf 'server {\n\
    listen 4000;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 4000
CMD ["nginx", "-g", "daemon off;"]
