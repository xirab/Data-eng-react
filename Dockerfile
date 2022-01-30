FROM node:latest as node
RUN mkdir -p /app
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . /app/
EXPOSE 8080
CMD ["npm", "run", "start"]
