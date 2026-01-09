FROM node:18 AS build
WORKDIR /app
 
# Copy source files
COPY . .
 
# Install dependencies and build the Angular app
RUN npm install -f
RUN npm run build -- --configuration production
 
# Step 2: Deploy with Nginx
FROM nginx:alpine
 
# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
 
# Copy Angular build output to Nginx's default serving directory
COPY --from=build /app/dist/fuse /usr/share/nginx/html
 
# Expose port 8443
EXPOSE 8443
 
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
