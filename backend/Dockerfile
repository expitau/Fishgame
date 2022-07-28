FROM node:alpine

# Create app directory
WORKDIR /app
COPY ./package.json .
RUN npm install
COPY . .

CMD [ "npm", "start"]
