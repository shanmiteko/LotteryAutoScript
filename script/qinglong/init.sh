#!/bin/env bash
set -e

NAME=LotteryAutoScript
BRABCH=main

# 视网络情况选择链接
GIT_REPO=https://github.com/shanmiteko/${NAME}.git
# GIT_REPO=https://ghproxy.com/https://github.com/shanmiteko/${NAME}.git

if [ -d "$NAME" ]; then
    cd $NAME
    git pull
    cd ..
else
    git clone -b $BRABCH $GIT_REPO $NAME
fi

if [ -f "$NAME/my_config.js" ]; then
    echo 'my_config 已存在'
else
    cp $NAME/my_config.example.js $NAME/my_config.js
fi

if [ -f "$NAME/env.js" ]; then
    echo 'env.js 已存在'
else
    cp $NAME/env.example.js $NAME/env.js
fi

function create() {
    cat >"${NAME}_$1.sh" <<EOF
#!/bin/env bash
cd $NAME
npm run $1
EOF
}

create start
create check
create clear
create account

cd $NAME
npm i
