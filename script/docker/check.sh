docker run \
-v $PWD/env.js:/lottery/env.js \
-v $PWD/my_config.json:/lottery/my_config.json \
-v $PWD/lib/:/lottery/lib/ \
shanmite/lottery_auto_docker \
check