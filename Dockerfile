# Etapa de construcción
FROM node:14-alpine as builder

# Instalar dependencias necesarias
RUN apk add --no-cache curl python3 build-base pkgconfig bash

# Descargar el script de Volta y ejecutarlo
RUN curl -sSL https://get.volta.sh -o /tmp/volta-install.sh && \
    bash /tmp/volta-install.sh

# Establecer las variables de entorno de Volta
ENV VOLTA_HOME=/root/.volta
ENV PATH=$VOLTA_HOME/bin:$PATH

# Instalar Node.js usando Volta
RUN volta install node@14.17.5

# Crear el directorio de trabajo y copiar los archivos
WORKDIR /app
COPY . .

# Instalar las dependencias, incluyendo devDependencies
RUN npm install --production=false

# Etapa final (imagen más ligera)
FROM node:14-alpine

# Etiqueta de Fly.io
LABEL fly_launch_runtime="nodejs"

# Copiar solo lo necesario de la etapa anterior (Volta y los archivos de la app)
COPY --from=builder /root/.volta /root/.volta
COPY --from=builder /app /app

# Establecer el directorio de trabajo
WORKDIR /app

# Definir el entorno y la variable PATH para Node.js
ENV NODE_ENV production
ENV PATH /root/.volta/bin:$PATH

# Ejecutar la aplicación en producción
CMD [ "npm", "run", "start" ]
