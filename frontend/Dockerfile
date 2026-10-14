FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build-time args — must be declared before the build step to be visible to Vite
ARG VITE_CALENDAR_SERVICE_URL
ARG VITE_CALENDAR_API_TOKEN
ENV VITE_CALENDAR_SERVICE_URL=$VITE_CALENDAR_SERVICE_URL
ENV VITE_CALENDAR_API_TOKEN=$VITE_CALENDAR_API_TOKEN

# Build the app
COPY . .
RUN npm run build

# Serve with a lightweight static server
RUN npm install -g serve
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]