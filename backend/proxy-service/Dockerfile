# Multi-stage build for Proxy Service
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3002

# Start
CMD ["npm", "run", "start:prod"]