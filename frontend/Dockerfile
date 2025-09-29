FROM node:20-alpine

WORKDIR /app
ENV CI=true

COPY package.json /app/package.json
# Si tienes lockfile, descomenta el tuyo:
# COPY package-lock.json /app/package-lock.json
# COPY yarn.lock /app/yarn.lock
# COPY pnpm-lock.yaml /app/pnpm-lock.yaml

RUN npm install

COPY . /app

EXPOSE 3000
CMD ["npm","run","dev","--","-p","3000","-H","0.0.0.0"]
