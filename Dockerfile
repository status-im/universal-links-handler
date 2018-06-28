FROM node:9-alpine

RUN mkdir -p /srv

ADD package.json /srv
ADD package-lock.json /srv

WORKDIR /srv

RUN npm install

ADD . /srv

CMD npm start
