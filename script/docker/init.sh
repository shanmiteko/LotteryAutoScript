#!/bin/bash

# 脚本根目录
script_folder=lottery

if [ ! -d "$script_folder" ]; then
    echo "create $script_folder"
    mkdir "$script_folder"
fi

cd $script_folder/

if [ ! -d "lib" ]; then
    mkdir "lib"
fi
curl -fsSL https://cdn.jsdelivr.net/gh/shanmite/LotteryAutoScript@main/env.example.js -o env.js
echo "{}" > my_config.json

echo "docker pull"
docker pull shanmite/lottery_auto_docker

echo "create start.sh"
echo -e "#!/bin/bash\n\
docker run \
-v $PWD/env.js:/lottery/env.js \
-v $PWD/my_config.json:/lottery/my_config.json \
-v $PWD/lib/:/lottery/lib/ \
shanmite/lottery_auto_docker \
start" \
> start.sh

echo "create check.sh"
echo -e "#!/bin/bash\n\
docker run \
-v $PWD/env.js:/lottery/env.js \
-v $PWD/my_config.json:/lottery/my_config.json \
-v $PWD/lib/:/lottery/lib/ \
shanmite/lottery_auto_docker \
check" \
> check.sh

echo "create clear.sh"
echo -e "#!/bin/bash\n\
docker run \
-v $PWD/env.js:/lottery/env.js \
-v $PWD/my_config.json:/lottery/my_config.json \
-v $PWD/lib/:/lottery/lib/ \
shanmite/lottery_auto_docker \
clear" \
> clear.sh