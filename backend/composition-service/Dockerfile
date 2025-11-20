FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install -D @nestjs/cli typescript
COPY . .
RUN npm run build
RUN npm prune --production

EXPOSE 3002
CMD ["node", "dist/src/main.js"]
