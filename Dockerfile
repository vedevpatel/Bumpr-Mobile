FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Reinstall drizzle-orm explicitly to ensure binary compatibility in Alpine
RUN npm install drizzle-orm pg

# Copy source code
COPY . .

# Build server (using the build script)
RUN npm run server:build

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server_dist/index.js"]
