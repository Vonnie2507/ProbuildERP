# Use Node.js 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start"]
