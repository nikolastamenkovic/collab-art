FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20 AS runtime

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=build /app/dist ./dist
COPY server.cjs ./

EXPOSE 3000
CMD ["node", "server.cjs"]
