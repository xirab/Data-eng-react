FROM node:10
WORKDIR /usr/src/bukky-app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "App.js" ]
