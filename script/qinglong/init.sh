#!/bin/env bash
set -e

NAME=LotteryAutoScript
GIT_REPO=https://github.com/shanmiteko/${NAME}.git
# GIT_REPO=https://ghproxy.com/https://github.com/shanmiteko/${NAME}.git

if [ -d "$NAME" ]; then
    cd $NAME
    git pull
    cd ..
else
    git clone $GIT_REPO $NAME --depth=1
fi

if [ -f "$NAME/my_config.js" ]; then
else
    cp $NAME/my_config.example.js $NAME/my_config.js
fi

if [ -f "$NAME/env.js" ]; then
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
create clean

cd $NAME
npm i
