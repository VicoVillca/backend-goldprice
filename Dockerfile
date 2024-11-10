# Usar una imagen base oficial de Node.js
FROM node:18-slim

# Crear y establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el package.json y package-lock.json (si existe) para instalar las dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar todo el código fuente del proyecto al contenedor
COPY . .

# Exponer el puerto que la aplicación usará
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
