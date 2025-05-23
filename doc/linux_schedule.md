1.通过ssh连接服务器  

1.1安装Node.js  

根据自己服务器的版本使用对应的命令安装  

> eg.[Ubuntu如何安装nodejs](https://zhuanlan.zhihu.com/p/140961618)


2.下载脚本到本地  

```sh
git clone https://github.com/shanmiteko/LotteryAutoScript.git
```


**注意**: github访问下载速度可能很慢, 如果卡住了可以通过Github镜像网站下载  

```sh
git clone https://github.com.cnpmjs.org/shanmiteko/LotteryAutoScript.git
```


3.`cd`命令进入目录,将其中的`env.example.js`文件重命名为`env.js`  

```sh
mv env.example.js env.js
mv my_config.example.js my_config.js
```


4.编辑env.js  

```sh
vim env.js
# 按i进入编辑模式
# 改完了依次输入 Esc => : => wq 即可保存退出
# 此处可查阅Vim的使用手册
```

详见[env.example.js](https://github.com/shanmiteko/LotteryAutoScript/blob/main/env.example.js)文件内部注释


[my_config.example.js](https://github.com/shanmiteko/LotteryAutoScript/blob/main/my_config.example.js)同理


~~5.设置定时工作~~

> [linux系统定时运行](https://zhuanlan.zhihu.com/p/58719487)  

输入:

```sh
crontab -e
```
cd 后的路径修改为你的脚本路径
```sh
SHELL=/bin/bash
PATH=/sbin:/bin:/usr/sbin/:/usr/bin

1 */3 * * * cd /root/LotteryAutoScript && npm i && npm run check
1 */3 * * * cd /root/LotteryAutoScript && npm i && npm run start
```


6.手动运行一波

`cd` 进入文件目录

`npm i`

`npm run start`

看看有没有效果

![image-start](pic/image-start.png)


7.如果本地的脚本需要更新

进入脚本目录下

```sh
git pull
```
