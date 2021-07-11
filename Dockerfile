# Latest Nodejs + Alpine Linux
FROM node:lts-alpine

MAINTAINER shanmiteko@github.com

LABEL version="1.0" description="自动参与B站动态抽奖"

WORKDIR /lottery

COPY ["package.json", "package*.json", "./"]

RUN npm install

COPY ["main.js", "./"]
COPY ["lib/", "lib/"]

ENTRYPOINT ["npm", "run"]
CMD ["start"]