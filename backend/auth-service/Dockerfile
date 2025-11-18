FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
# Install Nest CLI globally so 'nest build' command is available in the builder
RUN npm install -g @nestjs/cli@10
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm i --only=production
EXPOSE 3001
CMD ["node", "dist/main.js"]
