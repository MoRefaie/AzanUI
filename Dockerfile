# Use official Node.js image for build
FROM node:20-alpine AS builder

WORKDIR /AzanUIApp

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy only package files first for better caching
COPY AzanUIApp/package*.json ./
RUN npm install

# Copy the rest of the app source (including subfolders)
COPY AzanUIApp/. ./
RUN npm run build

# Use a lightweight Node image for running the app
FROM node:20-alpine

WORKDIR /AzanUIApp

COPY --from=builder /AzanUIApp ./

EXPOSE 8080

CMD ["npm", "run", "start"]