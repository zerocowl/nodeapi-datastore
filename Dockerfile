FROM node:8.9
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app


RUN npm install
RUN npm run build

CMD node ./dist/index.js
