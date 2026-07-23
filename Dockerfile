# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or bun.lock if using bun)
COPY package*.json ./

# Install dependencies
# We install all dependencies including devDependencies because we need them to build
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend and the backend server
RUN npm run build

# Expose the port the app runs on (Cloud Run defaults to 8080 but uses $PORT)
# The application is configured to listen on process.env.PORT
EXPOSE 3000

# Set environment variable to production
ENV NODE_ENV=production

# The start command runs the compiled backend server
CMD ["npm", "start"]
