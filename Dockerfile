FROM node:12-slim

WORKDIR /app
COPY . /app/

RUN yarn install

CMD ["yarn", "test"]
