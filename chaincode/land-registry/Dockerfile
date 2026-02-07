FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 9999

# Use the standard npm start which now uses the server command
CMD ["npm", "start"]
