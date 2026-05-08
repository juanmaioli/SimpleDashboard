FROM node:20-alpine

# Instalar herramientas de compilación y librerías necesarias
RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./

# Usar npm para una instalación más directa de módulos nativos en Alpine
# Esto forzará la compilación de better-sqlite3 desde el código fuente
RUN npm install

# Copiar el resto del código
COPY . .

# Asegurar directorios de persistencia
RUN mkdir -p public/icons public/backgrounds public/db

EXPOSE 8064

CMD ["node", "index.js"]
