##### Windows

step1: 下载代码到本地

[点此下载](https://github.com/shanmiteko/LotteryAutoScript/archive/refs/heads/main.zip)或如图示下载↓

![点我加载下载操作图示](pic/download.png)

下载的压缩包解压后修改env.example.js文件，详见step3

step2: 下载并安装Node.js

[点此进入nodejs下载页面](http://nodejs.cn/download)

![点我加载下载nodejs操作图示](pic/nodejs.png)

step3：修改env.example.js文件及创建运行文件(打开扩展名显示)

1.step1下载的压缩包解压后将其中的`env.example.js`文件重命名为`env.js`

2.右键`env.js`文件选择编辑或用记事本打开

3.填入相关参数

4.`my_config.example.js`同样操作

5.运行

注: `npm i`意味安装依赖, 只需运行一次, 为防止依赖有变化遂每次都执行

命令一: 启动抽奖

```bash
npm i && npm run start
```

命令二: 检查中奖

```bash
npm i && npm run check
```

命令三: 清理动态

```bash
npm i && npm run clear
```

`script`目录下有启动脚本, 点击即可运行

注: **本地运行时可在设置中增大扫描页数**

> [windows系统定时运行](./win_schedule.md)

脚本已内置定时运行功能

##### Linux

> [linux系统配置与定时运行](./linux_schedule.md)

脚本已内置定时运行功能