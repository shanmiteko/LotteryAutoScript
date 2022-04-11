# AutoScript

- [AutoScript](#autoscript)
  - [操作步骤](#操作步骤)
    - [获取COOKIE](#获取cookie)
    - [本地运行](#本地运行)
      - [可执行文件](#可执行文件)
      - [以源码方式运行](#以源码方式运行)
        - [Windows](#windows)
        - [Linux](#linux)
    - [Docker](#docker)
  - [防重复转发(可选)](#防重复转发可选)
  - [检测中奖](#检测中奖)
    - [检测未读信息, 已读未读信息](#检测未读信息-已读未读信息)
    - [中奖推送(可选)](#中奖推送可选)
  - [设置说明](#设置说明)
  - [Awesome](#awesome)

[Github仓库链接](https://github.com/shanmiteko/LotteryAutoScript)

[![Package Node.js project into an executable](https://github.com/shanmiteko/LotteryAutoScript/actions/workflows/pkg.yml/badge.svg)](https://github.com/shanmiteko/LotteryAutoScript/actions/workflows/pkg.yml)<br>
[![Build and push Docker images](https://github.com/shanmiteko/LotteryAutoScript/actions/workflows/docker.yml/badge.svg)](https://github.com/shanmiteko/LotteryAutoScript/actions/workflows/docker.yml)<br>
[![Publishing to NPM](https://github.com/shanmiteko/LotteryAutoScript/actions/workflows/npmp.yml/badge.svg)](https://github.com/shanmiteko/LotteryAutoScript/actions/workflows/npmp.yml)

已实现功能:

- 监控用户转发
- 监控话题页面
- 监控专栏合集
- 自动点赞、评论、乱序转发、@好友、带话题、可选随机动态
- 检测是否中奖
  - 已读@
  - 已读私信
- 清理动态关注
- 检查更新
- 更多功能设置请参考配置文件

**声明**: 此脚本仅用于学习和测试，作者本人并不对其负责，请于运行测试完成后自行删除，请勿滥用！

---------------------------------

## 操作步骤

**使用前务必阅读此教程和配置文件内注释**

右上角<kbd>★ Star</kbd>

↓↓

### 获取COOKIE

进入[B站主页](https://www.bilibili.com/)获取Cookie用于登录

Chrome浏览器:

1. `F12`打开控制台

2. 进入Application找到Cookies栏中的SESSDATA将HttpOnly选项**取消**勾选  

    (此步骤是为了方便后续采用JS获取Cookies,获取完毕后应再次勾选)

![取消httponly](https://gitee.com/shanmite/LotteryAutoScript/raw/main/doc/pic/getCookies.png)

3. 在Console中复制以下代码回车  

    ```js
    /** 自动复制到粘贴板 */
    document
      .cookie
      .split(/\s*;\s*/)
      .map(it => it.split('='))
      .filter(it => ['DedeUserID','bili_jct', 'SESSDATA'].indexOf(it[0]) > -1)
      .map(it => it.join('='))
      .join('; ')
      .split()
      .forEach(it => copy(it) || console.log(it))
    ```

也可以采用**其他方式获取**所需的Cookie

只需含有 `DedeUserID=...;SESSDATA=...;bili_jct=...` 三项即可

(分号分割, 不要换行, 顺序随意)

↓↓

### 本地运行

#### 可执行文件

1. [[下载](https://github.com/shanmiteko/LotteryAutoScript/releases)|[cnpmjs镜像下载](https://github.com.cnpmjs.org/shanmiteko/LotteryAutoScript/releases)|[Fastgit镜像下载](https://hub.fastgit.org/shanmiteko/LotteryAutoScript/releases)]压缩包并解压后

   ```
    ~/nlts-linux-x64
    => tree
    .
    ├── env.js          (便捷设置环境变量和多账号参数)
    ├── lottery         (可执行文件)
    ├── my_config.js    (自定义设置文件) (!使用前必读)
    └── README.md       (说明文件)
   ```

2. 用记事本或其他编辑器修改`env.js`和`my_config.js`文件(右键选择用记事本打开)
3. 在`env.js`中填入`COOKIE`和推送参数
4. 在`my_config.js`中自定义设置
5. 在当前目录下**打开终端**运行可执行文件`lottery`(勿直接点击`lottery`)

   ```sh
   # unix-like
   ## 进入脚本所在目录
   ## 授予执行权限
   $ chmod u+x lottery
   ## 启动脚本
   $ ./lottery start
   ## 检测中奖
   $ ./lottery check
   ## 清理关注动态
   $ ./lottery clear
   ## 下载最新版本
   $ ./lottery clear

   # windows
   ## 不需要chmod
   ## 把`./`换成`.\`或去掉
   ## 已自带*.bat可直接点击
   ```

7. 运行截图
  ![lottery_start](https://gitee.com/shanmite/LotteryAutoScript/raw/main/doc/pic/lottery_start.png)

#### 以源码方式运行

<details>

<summary>点击显示详细说明</summary>

##### Windows

step1: 下载代码到本地

[点此下载](https://github.com/shanmiteko/LotteryAutoScript/archive/refs/heads/main.zip)或如图示下载↓

![点我加载下载操作图示](https://gitee.com/shanmite/LotteryAutoScript/raw/main/doc/pic/download.png)

下载的压缩包解压后修改env.example.js文件，详见step3

step2: 下载并安装Node.js

[点此进入nodejs下载页面](http://nodejs.cn/download)

![点我加载下载nodejs操作图示](https://gitee.com/shanmite/LotteryAutoScript/raw/main/doc/pic/nodejs.png)

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

> ~~[windows系统定时运行](./doc/win_schedule.md)~~

脚本已内置定时运行功能

##### Linux

[linux系统配置与定时运行](./doc/linux_schedule.md)

</details>

### Docker

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
├── check.sh
├── clear.sh
├── debug.sh 进入临时容器查看内容
├── env.js
├── my_config.js
├── new_env.js
├── new_my_config.js
├── remove_all.sh 移除对应docker镜像和所有相关容器
└── start.sh 
```

[![asciicast](https://asciinema.org/a/453237.svg)](https://asciinema.org/a/453237)

3.更新

进入lottery上一级目录

使用与初始化相同的命令

----------------------------------------

## 防重复转发(可选)

- 脚本将转发过的动态和被过滤的动态都写入`dyids/dyid*.txt`文件中

- 是否点赞

----------------------------------------

## 检测中奖

### 检测未读信息, 已读未读信息

判断依据

- 通过`@`信息判断

- 通过私信判断

关键词有限 可能会有**漏掉**的或**误报**

### 中奖推送(可选)

> 填写在env.js内

以下是支持的推送方式

|       Name        |                                        归属                                        | 说明                                                                                                                                                                                                                                                                          |
| :---------------: | :--------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|      `SCKEY`      |                          微信server酱推送(于2021/4月下线)                          | server酱的微信通知[官方文档](http://sc.ftqq.com/3.version)                                                                                                                                                                                                                    |
|     `SENDKEY`     |                             微信server酱(Turbo版)推送                              | [获取SENDKEY](https://sct.ftqq.com/sendkey) [选择消息通道](https://sct.ftqq.com/forward)                                                                                                                                                                                      |
|    `BARK_PUSH`    | [BARK推送](https://apps.apple.com/us/app/bark-customed-notifications/id1403753865) | IOS用户下载BARK这个APP,填写内容是app提供的`设备码`，例如：<https://api.day.app/123> ，那么此处的设备码就是`123`，再不懂看 [这个图](https://gitee.com/shanmite/LotteryAutoScript/raw/main/doc/pic/bark.jpg)（注：支持自建填完整链接即可）                                      |
|   `BARK_SOUND`    | [BARK推送](https://apps.apple.com/us/app/bark-customed-notifications/id1403753865) | bark推送声音设置，例如`choo`,具体值请在`bark`-`推送铃声`-`查看所有铃声`                                                                                                                                                                                                       |
|  `TG_BOT_TOKEN`   |                                    telegram推送                                    | tg推送(需设备可连接外网),`TG_BOT_TOKEN`和`TG_USER_ID`两者必需,填写自己申请[@BotFather](https://t.me/BotFather)的Token,如`10xxx4:AAFcqxxxxgER5uw` , [具体教程](doc/TG_PUSH.md)                                                                                                 |
|   `TG_USER_ID`    |                                    telegram推送                                    | tg推送(需设备可连接外网),`TG_BOT_TOKEN`和`TG_USER_ID`两者必需,填写[@getuseridbot](https://t.me/getuseridbot)中获取到的纯数字ID, [具体教程](doc/TG_PUSH.md)                                                                                                                    |
|  `TG_PROXY_HOST`  |                                 Telegram 代理的 IP                                 | 代理类型为 http。例子：http代理 <http://127.0.0.1:1080> 则填写 127.0.0.1                                                                                                                                                                                                      |
|  `TG_PROXY_PORT`  |                                Telegram 代理的端口                                 | 例子：http代理 <http://127.0.0.1:1080> 则填写 1080                                                                                                                                                                                                                            |
|  `DD_BOT_TOKEN`   |                                      钉钉推送                                      | 钉钉推送(`DD_BOT_TOKEN`和`DD_BOT_SECRET`两者必需)[官方文档](https://ding-doc.dingtalk.com/doc#/serverapi2/qf2nxq) ,只需`https://oapi.dingtalk.com/robot/send?access_token=XXX` 等于`=`符号后面的XXX即可                                                                       |
|  `DD_BOT_SECRET`  |                                      钉钉推送                                      | (`DD_BOT_TOKEN`和`DD_BOT_SECRET`两者必需) ,密钥，机器人安全设置页面，加签一栏下面显示的SEC开头的`SECXXXXXXXXXX`等字符 , 注:钉钉机器人安全设置只需勾选`加签`即可，其他选项不要勾选,再不懂看 [这个图](https://gitee.com/shanmite/LotteryAutoScript/raw/main/doc/pic/DD_bot.png) |
|  `IGOT_PUSH_KEY`  |                                      iGot推送                                      | iGot聚合推送，支持多方式推送，确保消息可达。 [参考文档](https://wahao.github.io/Bark-MP-helper )                                                                                                                                                                              |
|     `QQ_SKEY`     |                                酷推(Cool Push)推送                                 | 推送所需的Skey,登录后获取Skey [参考文档](https://cp.xuthus.cc/)                                                                                                                                                                                                               |
|     `QQ_MODE`     |                                酷推(Cool Push)推送                                 | 推送方式(send或group或者wx，默认send) [参考文档](https://cp.xuthus.cc/)                                                                                                                                                                                                       |
|    `QYWX_KEY`     |                                    企业微信推送                                    | 密钥，企业微信推送 webhook 后面的 key [详见官方说明文档](https://work.weixin.qq.com/api/doc/90000/90136/91770)                                                                                                                                                                |
| `PUSH_PLUS_TOKEN` |                                    pushplus推送                                    | 微信扫码登录后一对一推送或一对多推送下面的token(您的Token) [官方网站](http://pushplus.hxtrip.com/)                                                                                                                                                                            |
| `PUSH_PLUS_USER`  |                                    pushplus推送                                    | 一对多推送的“群组编码”（一对多推送下面->您的群组(如无则新建)->群组编码）注:(1、需订阅者扫描二维码 2、如果您是创建群组所属人，也需点击“查看二维码”扫描绑定，否则不能接受群组消息推送)，只填`PUSH_PLUS_TOKEN`默认为一对一推送                                                   |
|    `QMSG_KEY`     |                      [Qmsg酱](https://qmsg.zendee.cn)私聊推送                      | [Qmsg注册](https://qmsg.zendee.cn/login.html)                                                                                                                                                                                                                                 |
|     `QMSG_QQ`     |                       私聊消息推送接口，指定需要接收消息的QQ                       | 指定的QQ号必须在你的[管理台](https://qmsg.zendee.cn/me.html)已添加                                                                                                                                                                                                            |
|    `SMTP_HOST`    |                                      电子邮件                                      | smtp服务器的主机名 如: `smtp.qq.com`                                                                                                                                                                                                                                          |
|    `SMTP_PORT`    |                                      电子邮件                                      | smtp服务器的端口 如: `465`                                                                                                                                                                                                                                                    |
|    `SMTP_USER`    |                                      电子邮件                                      | 发送方的电子邮件   如: `xxxxxxxxx@qq.com`                                                                                                                                                                                                                                     |
|    `SMTP_PASS`    |                                      电子邮件                                      | smtp服务对应的授权码                                                                                                                                                                                                                                                          |
|  `SMTP_TO_USER`   |                                      电子邮件                                      | 接收方电子邮件                                                                                                                                                                                                                                                                |

----------------------------------------

## 设置说明

详见[env.example.js](./env.example.js)文件内部注释

详见[my_config.example.js](./my_config.example.js)文件内部注释

## Awesome
相关项目

- [LotteryAutoScript_Station](https://github.com/spiritLHLS/LotteryAutoScript_Station) - [@spiritLHL](https://github.com/spiritLHLS)
- [sync_lottery](https://github.com/spiritLHLS/sync_lottery) - [@spiritLHL](https://github.com/spiritLHLS)
- [BDSF](https://github.com/spiritLHLS/BDSF) - [@spiritLHL](https://github.com/spiritLHLS)
