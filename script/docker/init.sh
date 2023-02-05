#!/bin/bash
set -e

# 脚本根目录
SCRIPT_FOLDER=lottery
# 设置环境变量文件
ENV_FILE=env.js
# 自定义设置文件
CONFIG_FILE=my_config.js
# docker仓库
DOCKER_REPO=shanmite/lottery_auto_docker
# cdn
CDN=https://cdn.staticaly.com/gh/shanmiteko/LotteryAutoScript/main
# env.example.js文件
ENV_EXAMPLE="$CDN/env.example.js"
# my_config.example.js文件
CONFIG_EXAMPLE="$CDN/my_config.example.js"

# 新建脚本目录
if [ ! -d "$SCRIPT_FOLDER" ]; then
    echo "create $SCRIPT_FOLDER"
    mkdir $SCRIPT_FOLDER
fi

cd $SCRIPT_FOLDER/

# 新建环境变量设置文件
if [ ! -f "$ENV_FILE" ]; then
    echo "create $ENV_FILE"
    curl -fsSL $ENV_EXAMPLE -o $ENV_FILE
else
    echo "$ENV_FILE already existed"
    echo "create new_$ENV_FILE"
    curl -fsSL $ENV_EXAMPLE -o "new_$ENV_FILE"
fi

# 新建配置文件
if [ ! -f "$CONFIG_FILE" ]; then
    echo "create $CONFIG_FILE"
    curl -fsSL $CONFIG_EXAMPLE -o $CONFIG_FILE
else
    echo "$CONFIG_FILE already existed"
    echo "create new_$CONFIG_FILE"
    curl -fsSL $CONFIG_EXAMPLE -o "new_$CONFIG_FILE"
fi

echo "docker pull $DOCKER_REPO"
docker -v && docker pull $DOCKER_REPO

echo "create start.sh"
cat >start.sh <<EOF
#!$(which env) bash
NAME=shanmite-lottery-start
if [[ -z "\$(docker ps -a | grep \$NAME)" ]]; then
    docker run \\
        -v $PWD/$ENV_FILE:/lottery/$ENV_FILE \\
        -v $PWD/$CONFIG_FILE:/lottery/$CONFIG_FILE \\
        --name \$NAME \\
        $DOCKER_REPO \\
        start
else
    echo "container \$NAME already existed"
    echo "history logs -> docker logs \$NAME"
    echo "close this -> docker stop \$NAME"
    echo "start \$NAME"
    docker start \$NAME
fi
EOF
chmod +x start.sh

echo "create check.sh"
cat >check.sh <<EOF
#!$(which env) bash
NAME=shanmite-lottery-check
if [[ -z "\$(docker ps -a | grep \$NAME)" ]]; then
    docker run \\
        -v $PWD/$ENV_FILE:/lottery/$ENV_FILE \\
        -v $PWD/$CONFIG_FILE:/lottery/$CONFIG_FILE \\
        --name \$NAME \\
        $DOCKER_REPO \\
        check
else
    echo "container \$NAME already existed"
    echo "history logs -> docker logs \$NAME"
    echo "close this -> docker stop \$NAME"
    echo "start \$NAME"
    docker start \$NAME
fi
EOF
chmod +x check.sh

echo "create clear.sh"
cat >clear.sh <<EOF
#!$(which env) bash
NAME=shanmite-lottery-clear
if [[ -z "\$(docker ps -a | grep \$NAME)" ]]; then
    docker run \\
        -v $PWD/$ENV_FILE:/lottery/$ENV_FILE \\
        -v $PWD/$CONFIG_FILE:/lottery/$CONFIG_FILE \\
        --name \$NAME \\
        $DOCKER_REPO \\
        clear
else
    echo "container \$NAME already existed"
    echo "history logs -> docker logs \$NAME"
    echo "close this -> docker stop \$NAME"
    echo "start \$NAME"
    docker start \$NAME
fi
EOF
chmod +x clear.sh

echo "create debug.sh"
cat >debug.sh <<EOF
#!$(which env) bash
NAME=shanmite-lottery-debug
echo "create temporary debug container"
docker run \\
    -it \\
    --name \$NAME \\
    --entrypoint /bin/bash \\
    $DOCKER_REPO -c bash
echo "remove temporary debug container"
docker rm -v \$NAME
EOF
chmod +x debug.sh

echo "create remove_all.sh"
cat >remove_all.sh <<EOF
#!$(which env) bash
echo "remove all containers about $DOCKER_REPO"
docker rm -v \$(docker ps -a | awk '/shanmite\/lottery_auto_docker/ {print \$1}')
echo "remove image $DOCKER_REPO"
docker image rm -f shanmite/lottery_auto_docker
echo "see you next time!"
EOF
chmod +x remove_all.sh
