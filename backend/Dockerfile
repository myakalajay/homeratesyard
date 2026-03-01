# 🟢 BACKEND: Node.js API Gateway
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (optimizes cache)
COPY package*.json ./

# Install dependencies (Production Only)
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the API Port
EXPOSE 4000

# Start command (Matches 'npm start' or 'node server.js')
CMD ["node", "server.js"]