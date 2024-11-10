# Etapa de construcción
FROM node:14-alpine as builder

# Instalar dependencias necesarias para la construcción
RUN apk add --no-cache curl python3 build-base pkgconfig

# Instalar Volta (gestor de versiones de Node)
RUN curl https://get.volta.sh | bash
ENV VOLTA_HOME /root/.volta
ENV PATH /root/.volta/bin:$PATH
RUN volta install node@14.17.5

# Crear directorio de la aplicación y copiar archivos
WORKDIR /app
COPY . .

# Instalar las dependencias, sin incluir devDependencies
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
