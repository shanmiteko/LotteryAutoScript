#!/bin/bash
set -e

# docker环境预安装
REGEX=("debian" "ubuntu" "centos|red hat|kernel|oracle linux|alma|rocky" "'amazon linux'" "fedora" "arch")
RELEASE=("Debian" "Ubuntu" "CentOS" "CentOS" "Fedora" "Arch")
PACKAGE_UPDATE=("! apt-get update && apt-get --fix-broken install -y && apt-get update" "apt-get update" "yum -y update" "yum -y update" "yum -y update" "pacman -Sy")
PACKAGE_INSTALL=("apt-get -y install" "apt-get -y install" "yum -y install" "yum -y install" "yum -y install" "pacman -Sy --noconfirm --needed")
PACKAGE_REMOVE=("apt-get -y remove" "apt-get -y remove" "yum -y remove" "yum -y remove" "yum -y remove" "pacman -Rsc --noconfirm")
PACKAGE_UNINSTALL=("apt-get -y autoremove" "apt-get -y autoremove" "yum -y autoremove" "yum -y autoremove" "yum -y autoremove" "")
CMD=("$(grep -i pretty_name /etc/os-release 2>/dev/null | cut -d \" -f2)" "$(hostnamectl 2>/dev/null | grep -i system | cut -d : -f2)" "$(lsb_release -sd 2>/dev/null)" "$(grep -i description /etc/lsb-release 2>/dev/null | cut -d \" -f2)" "$(grep . /etc/redhat-release 2>/dev/null)" "$(grep . /etc/issue 2>/dev/null | cut -d \\ -f1 | sed '/^[ ]*$/d')" "$(grep -i pretty_name /etc/os-release 2>/dev/null | cut -d \" -f2)")
SYS="${CMD[0]}"
[[ -n $SYS ]] || exit 1
for ((int = 0; int < ${#REGEX[@]}; int++)); do
    if [[ $(echo "$SYS" | tr '[:upper:]' '[:lower:]') =~ ${REGEX[int]} ]]; then
        SYSTEM="${RELEASE[int]}"
        [[ -n $SYSTEM ]] && break
    fi
done
if ! systemctl is-active docker >/dev/null 2>&1; then
    if [ $SYSTEM = "CentOS" ]; then
        ${PACKAGE_INSTALL[int]} yum-utils
        yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo &&
            ${PACKAGE_INSTALL[int]} docker-ce docker-ce-cli containerd.io
        systemctl enable --now docker
    else
        ${PACKAGE_INSTALL[int]} docker.io
    fi
fi

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
        --network host \\
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
        --network host \\
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

echo "create account.sh"
cat >account.sh <<EOF
#!$(which env) bash
NAME=shanmite-lottery-account
if [[ -z "\$(docker ps -a | grep \$NAME)" ]]; then
    docker run \\
        -v $PWD/$ENV_FILE:/lottery/$ENV_FILE \\
        -v $PWD/$CONFIG_FILE:/lottery/$CONFIG_FILE \\
        --network host \\
        --name \$NAME \\
        $DOCKER_REPO \\
        account
else
    echo "container \$NAME already existed"
    echo "history logs -> docker logs \$NAME"
    echo "close this -> docker stop \$NAME"
    echo "start \$NAME"
    docker start \$NAME
fi
EOF
chmod +x account.sh

echo "create clear.sh"
cat >clear.sh <<EOF
#!$(which env) bash
NAME=shanmite-lottery-clear
if [[ -z "\$(docker ps -a | grep \$NAME)" ]]; then
    docker run \\
        -v $PWD/$ENV_FILE:/lottery/$ENV_FILE \\
        -v $PWD/$CONFIG_FILE:/lottery/$CONFIG_FILE \\
        --network host \\
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
    --network host \\
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

echo "create login.sh"
cat >login.sh <<EOF
#!$(which env) bash
NAME=shanmite-lottery-login
if [[ -z "\$(docker ps -a | grep \$NAME)" ]]; then
    docker run \\
        -v $PWD/$ENV_FILE:/lottery/$ENV_FILE \\
        -v $PWD/$CONFIG_FILE:/lottery/$CONFIG_FILE \\
        --network host \\
        --name \$NAME \\
        $DOCKER_REPO \\
        login
else
    echo "container \$NAME already existed"
    echo "history logs -> docker logs \$NAME"
    echo "close this -> docker stop \$NAME"
    echo "login \$NAME"
    docker login \$NAME
fi
EOF
chmod +x login.sh