# Usamos Node 22.12-alpine para Angular CLI
FROM node:22.12-alpine

WORKDIR /app

# Instalamos dependencias con npm para evitar inestabilidad de bun + ng serve en contenedor
COPY package.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de desarrollo
EXPOSE 4200

# Comando para iniciar
CMD ["npm", "run", "start"]
