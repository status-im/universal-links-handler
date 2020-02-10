FROM node:12-alpine

RUN mkdir -p /srv

ADD package.json /srv
ADD package-lock.json /srv

WORKDIR /srv

RUN yarn install

ADD . /srv

CMD yarn start
