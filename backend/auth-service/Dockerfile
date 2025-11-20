FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install -D @nestjs/cli typescript
COPY . .
RUN npm run build
RUN npm prune --production

EXPOSE 3001
CMD ["node", "dist/main.js"]
