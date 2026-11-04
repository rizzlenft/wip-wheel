# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY tsconfig.json ./
COPY catalog ./catalog
COPY src ./src
ENV NODE_ENV=production
ENV DEV_AUTH_BYPASS=false
ENV DATA_DIR=/app/data
RUN mkdir -p /app/data
ENV PORT=8787
EXPOSE 8787
CMD ["npx", "tsx", "src/index.ts"]
