FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY *.js ./
EXPOSE 5088
CMD ["node", "backend-server.js"]
