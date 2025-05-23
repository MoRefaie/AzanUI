# Use official Node.js image for build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Use a lightweight web server to serve the built app
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 8000

CMD ["npm", "run", "start"]