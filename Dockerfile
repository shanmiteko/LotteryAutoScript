FROM node:lts-alpine

LABEL author="shanmite" version="1.1" description="自动参与B站动态抽奖"

WORKDIR /lottery

COPY ["package.json", "./"]

RUN npm install

COPY ["main.js", "./"]
COPY ["lib/", "lib/"]

ENTRYPOINT ["npm", "run"]
CMD ["start"]