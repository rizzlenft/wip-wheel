# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY tsconfig.json ./
COPY src ./src
ENV NODE_ENV=production
ENV PORT=8790
ENV DATA_DIR=/data
VOLUME ["/data"]
EXPOSE 8790
CMD ["npx", "tsx", "src/server.ts"]
