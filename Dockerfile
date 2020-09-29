FROM node:12-alpine

RUN apk --no-cache add git

RUN mkdir -p /srv

ADD . /srv

WORKDIR /srv

RUN yarn install

ENV NODE_ENV=production

CMD yarn run start
EXPOSE 3000
