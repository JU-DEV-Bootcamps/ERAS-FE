# Use the official Node.js image for development
FROM node:18 AS build
WORKDIR /app

# Copy project files to the container
COPY . ./

# Install dependencies and build the application
RUN npm install
RUN npm run build --configuration=production

# Final image to serve the application
FROM nginx:alpine
COPY --from=build /app/dist/eras-fe/browser /usr/share/nginx/html

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80