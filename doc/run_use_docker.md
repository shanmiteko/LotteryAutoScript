1.初始化

```bash
curl -fsSL https://cdn.staticaly.com/gh/shanmiteko/LotteryAutoScript/main/script/docker/init.sh | sudo sh
```

进入`lottery`文件夹

```bash
cd lottery
```

编辑`env.js`与`my_config.js`文件

- env.js 设置必要环境变量
- my_config.js 你的设置

2.执行相应的脚本
```
$ tree
.
├── check.sh 检查中奖
├── clear.sh 清理动态
├── debug.sh 进入临时容器查看内容
├── env.js
├── my_config.js
├── new_env.js
├── new_my_config.js
├── remove_all.sh 移除对应docker镜像和所有相关容器
└── start.sh 启动抽奖
```
[![asciicast](https://asciinema.org/a/453237.svg)](https://asciinema.org/a/453237)

完成配置后

```sh
$ ./start.sh
```
3.更新

进入lottery上一级目录

使用与初始化相同的命令