FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]