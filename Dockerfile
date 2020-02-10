FROM node:12-alpine

RUN apk --no-cache add git

RUN mkdir -p /srv

ADD package.json /srv
ADD yarn.lock /srv

WORKDIR /srv

RUN yarn install

ADD . /srv

CMD yarn start
EXPOSE 3000
