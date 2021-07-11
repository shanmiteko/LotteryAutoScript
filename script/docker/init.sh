#!/bin/bash

# 脚本根目录
SCRIPT_FOLDER=lottery
# dyid存放目录
DYID_FOLDER=dyids
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

# 新建dyid储存目录
if [ ! -d "$DYID_FOLDER" ]; then
    echo "create $DYID_FOLDER/"
    mkdir $DYID_FOLDER
else
    echo "$DYID_FOLDER/ exists"
fi

# 新建环境变量设置文件
if [ ! -f "$ENV_FILE" ]; then
    echo "create $ENV_FILE"
    curl -fsSL $ENV_EXAMPLE -o $ENV_FILE
else
    echo "$ENV_FILE exists"
fi

# 新建配置文件
if [ ! -f "$CONFIG_FILE" ]; then
    echo "create $CONFIG_FILE"
    curl -fsSL $CONFIG_EXAMPLE -o $CONFIG_FILE
else
    echo "$CONFIG_FILE exists"
fi

echo "docker pull $DOCKER_REPO"
docker -v && docker pull $DOCKER_REPO

echo "create start.sh"
echo -e "#!/bin/bash\n\
docker run \
-v $PWD/$ENV_FILE:/lottery/$ENV_FILE \
-v $PWD/$CONFIG_FILE:/lottery/$CONFIG_FILE \
-v $PWD/$DYID_FOLDER/:/lottery/$DYID_FOLDER/ \
$DOCKER_REPO \
start" \
> start.sh
chmod 777 start.sh

echo "create check.sh"
echo -e "#!/bin/bash\n\
docker run \
-v $PWD/$ENV_FILE:/lottery/$ENV_FILE \
-v $PWD/$CONFIG_FILE:/lottery/$CONFIG_FILE \
-v $PWD/$DYID_FOLDER/:/lottery/$DYID_FOLDER/ \
$DOCKER_REPO \
check" \
> check.sh
chmod 777 check.sh

echo "create clear.sh"
echo -e "#!/bin/bash\n\
docker run \
-v $PWD/$ENV_FILE:/lottery/$ENV_FILE \
-v $PWD/$CONFIG_FILE:/lottery/$CONFIG_FILE \
-v $PWD/$DYID_FOLDER/:/lottery/$DYID_FOLDER/ \
$DOCKER_REPO \
clear" \
> clear.sh
chmod 777 clear.sh
