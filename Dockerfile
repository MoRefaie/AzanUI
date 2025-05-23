# Use official Node.js image for build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy only package files first for better caching
COPY AzanUI/package*.json ./
RUN npm install

# Copy the rest of the app source
COPY AzanUI/ ./
RUN npm run build

# Use a lightweight Node image for running the app
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "run", "start"]