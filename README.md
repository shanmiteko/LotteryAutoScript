# AutoScript
![Automatic sweepstakes](https://github.com/shanmite/LotteryAutoScript/workflows/Automatic%20sweepstakes/badge.svg)

![Automatic check](https://github.com/shanmite/LotteryAutoScript/workflows/Automatic%20check/badge.svg)

![Automatic clear dynamic&follow](https://github.com/shanmite/LotteryAutoScript/workflows/Automatic%20clear%20dynamic&follow/badge.svg)

![Automatic sync](https://github.com/shanmite/LotteryAutoScript/workflows/Automatic%20sync/badge.svg)

- [AutoScript](#autoscript)
  - [操作步骤](#操作步骤)
    - [获取COOKIE](#获取cookie)
    - [本地运行](#本地运行)
      - [Windows](#windows)
      - [Linux](#linux)
    - [Docker](#docker)
  - [防重复转发](#防重复转发)
  - [检测中奖](#检测中奖)
    - [检测未读信息, 已读未读信息](#检测未读信息-已读未读信息)
    - [中奖推送(可选)](#中奖推送可选)
  - [设置说明](#设置说明)
    - [模式选择](#模式选择)
    - [自定义设置](#自定义设置)

已实现功能:  
  > 点赞 评论 转发 @好友 带话题 随机动态 检测开奖 清理

声明: 此脚本仅用于学习和测试，作者本人并不对其负责，请于运行测试完成后自行删除，请勿滥用！  

----------------------------------------

## 操作步骤

右上角<kbd>★ Star</kbd>

↓↓

### 获取COOKIE

进入[B站主页](https://www.bilibili.com/)获取Cookie用于登录

Chrome浏览器:

1. `F12`打开控制台

2. 进入Application找到Cookies栏中的SESSDATA将HttpOnly选项**取消**勾选  

    (此步骤是为了方便后续采用JS获取Cookies)  

![取消httponly](doc/pic/getCookies.png)

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
具体操作详见[env.example.js](env.example.js)文件内注释  
#### Windows
step1: 下载代码到本地  

[点此下载](https://github.com/shanmite/LotteryAutoScript/archive/refs/heads/main.zip)或如图示下载↓

![点我加载下载操作图示](doc/pic/download.png)

下载的压缩包解压后修改env.example.js文件，详见step3  

step2: 下载并安装Node.js  

[点此进入nodejs下载页面](http://nodejs.cn/download)

![点我加载下载nodejs操作图示](doc/pic/nodejs.png)

step3：修改env.example.js文件及创建运行文件(打开扩展名显示)

1.step1下载的压缩包解压后将其中的`env.example.js`文件重命名为`env.js`  

2.右键`env.js`文件选择编辑或用记事本打开  

3.填入相关参数  

4.运行  
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

> [windows系统定时运行](./doc/win_schedule.md)

#### Linux
[linux系统配置与定时运行](./doc/linux_schedule.md)

### Docker

初始化

```bash
curl -fsSL https://cdn.jsdelivr.net/gh/shanmite/LotteryAutoScript@main/script/docker/init.sh | sh
```

进入`lottery`文件夹

编辑`env.js`与`my_config.json`文件
- env.js 设置必要环境变量
- my_config.json 写入你要覆盖的默认设置

执行相应的脚本

----------------------------------------

## 防重复转发
脚本将所转发过的动态都写入`lib/dyid*.txt`文件中

完整转发一轮后才会进行写入操作, 勿过早关闭运行

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

|       Name        |                                        归属                                        | 属性   | 说明                                                                                                                                                                                                                        |
| :---------------: | :--------------------------------------------------------------------------------: | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|      `SCKEY`      |                          微信server酱推送(于2021/4月下线)                          | 非必须 | server酱的微信通知[官方文档](http://sc.ftqq.com/3.version)                                                                                                                                                                  |
|     `SENDKEY`     |                             微信server酱(Turbo版)推送                              | 非必须 | [获取SENDKEY](https://sct.ftqq.com/sendkey) [选择消息通道](https://sct.ftqq.com/forward)                                                                                                                                    |
|    `BARK_PUSH`    | [BARK推送](https://apps.apple.com/us/app/bark-customed-notifications/id1403753865) | 非必须 | IOS用户下载BARK这个APP,填写内容是app提供的`设备码`，例如：https://api.day.app/123 ，那么此处的设备码就是`123`，再不懂看 [这个图](doc/pic/bark.jpg)（注：支持自建填完整链接即可）                                            |
|   `BARK_SOUND`    | [BARK推送](https://apps.apple.com/us/app/bark-customed-notifications/id1403753865) | 非必须 | bark推送声音设置，例如`choo`,具体值请在`bark`-`推送铃声`-`查看所有铃声`                                                                                                                                                     |
|  `TG_BOT_TOKEN`   |                                    telegram推送                                    | 非必须 | tg推送(需设备可连接外网),`TG_BOT_TOKEN`和`TG_USER_ID`两者必需,填写自己申请[@BotFather](https://t.me/BotFather)的Token,如`10xxx4:AAFcqxxxxgER5uw` , [具体教程](doc/TG_PUSH.md)                                               |
|   `TG_USER_ID`    |                                    telegram推送                                    | 非必须 | tg推送(需设备可连接外网),`TG_BOT_TOKEN`和`TG_USER_ID`两者必需,填写[@getuseridbot](https://t.me/getuseridbot)中获取到的纯数字ID, [具体教程](doc/TG_PUSH.md)                                                                  |
|  `TG_PROXY_HOST`  |                                 Telegram 代理的 IP                                 | 非必须 | 代理类型为 http。例子：http代理 http://127.0.0.1:1080 则填写 127.0.0.1                                                                                                                                                      |
|  `TG_PROXY_PORT`  |                                Telegram 代理的端口                                 | 非必须 | 例子：http代理 http://127.0.0.1:1080 则填写 1080                                                                                                                                                                            |
|  `DD_BOT_TOKEN`   |                                      钉钉推送                                      | 非必须 | 钉钉推送(`DD_BOT_TOKEN`和`DD_BOT_SECRET`两者必需)[官方文档](https://ding-doc.dingtalk.com/doc#/serverapi2/qf2nxq) ,只需`https://oapi.dingtalk.com/robot/send?access_token=XXX` 等于`=`符号后面的XXX即可                     |
|  `DD_BOT_SECRET`  |                                      钉钉推送                                      | 非必须 | (`DD_BOT_TOKEN`和`DD_BOT_SECRET`两者必需) ,密钥，机器人安全设置页面，加签一栏下面显示的SEC开头的`SECXXXXXXXXXX`等字符 , 注:钉钉机器人安全设置只需勾选`加签`即可，其他选项不要勾选,再不懂看 [这个图](doc/pic/DD_bot.png)     |
|  `IGOT_PUSH_KEY`  |                                      iGot推送                                      | 非必须 | iGot聚合推送，支持多方式推送，确保消息可达。 [参考文档](https://wahao.github.io/Bark-MP-helper )                                                                                                                            |
|     `QQ_SKEY`     |                                酷推(Cool Push)推送                                 | 非必须 | 推送所需的Skey,登录后获取Skey [参考文档](https://cp.xuthus.cc/)                                                                                                                                                             |
|     `QQ_MODE`     |                                酷推(Cool Push)推送                                 | 非必须 | 推送方式(send或group或者wx，默认send) [参考文档](https://cp.xuthus.cc/)                                                                                                                                                     |
|    `QYWX_KEY`     |                                    企业微信推送                                    | 非必须 | 密钥，企业微信推送 webhook 后面的 key [详见官方说明文档](https://work.weixin.qq.com/api/doc/90000/90136/91770)                                                                                                              |
| `PUSH_PLUS_TOKEN` |                                    pushplus推送                                    | 非必须 | 微信扫码登录后一对一推送或一对多推送下面的token(您的Token) [官方网站](http://pushplus.hxtrip.com/)                                                                                                                          |
| `PUSH_PLUS_USER`  |                                    pushplus推送                                    | 非必须 | 一对多推送的“群组编码”（一对多推送下面->您的群组(如无则新建)->群组编码）注:(1、需订阅者扫描二维码 2、如果您是创建群组所属人，也需点击“查看二维码”扫描绑定，否则不能接受群组消息推送)，只填`PUSH_PLUS_TOKEN`默认为一对一推送 |
|    `SMTP_HOST`    |                                      电子邮件                                      | 非必须 | smtp服务器的主机名 如: `smtp.qq.com`                                                                                                                                                                                        |
|    `SMTP_PORT`    |                                      电子邮件                                      | 非必须 | smtp服务器的端口 如: `465`                                                                                                                                                                                                  |
|    `SMTP_USER`    |                                      电子邮件                                      | 非必须 | 发送方的电子邮件   如: `xxxxxxxxx@qq.com`                                                                                                                                                                                   |
|    `SMTP_PASS`    |                                      电子邮件                                      | 非必须 | smtp服务对应的授权码                                                                                                                                                                                                        |
|  `SMTP_TO_USER`   |                                      电子邮件                                      | 非必须 | 接收方电子邮件                                                                                                                                                                                                              |

----------------------------------------

## 设置说明
### 模式选择
  `lib/config.js`

  <details>
  <summary>点击显示所有设置的详细说明</summary>

  - `model`
    - `'00'`关闭自动抽奖
    - `'10'`只转发官方抽奖
    - `'01'`只转发非官方抽奖
    - `'11'`都转
  - `chatmodel`
    - `'00'`关闭自动评论
    - `'10'`只评论官抽
    - `'01'`只评论非官抽
    - `'11'`都评论
  - `scan_page_num`
    - 在uid或tag里检索的页数
    - `number`
  - `maxday`
    - 开奖时间距离现在的最大天数
    - 默认为`-1`表示不限制
    - `string`
  - `wait`
    - 转发间隔时间
    - 单位毫秒
    - 上下浮动50%
    - `string`
  - `minfollower`
    - up主粉丝数限制
    - 仅限制没有官方认证的up
    - `string`
  - `only_followed`
    - 只转发已关注的
    - `'1'`开启
    - `'0'`关闭
  - `create_dy`
    - 是否发送随机动态(防止被开奖机过滤)
    - `'1'`开启
    - `'0'`关闭
  - `create_dy_num`
    - 发送随机动态的数量
    - `number`
  - `dy_contents`
    - 随机动态内容
    - 类型 `content[]`
      ```js
      /**
       * @typedef Picture
       * @property {string} img_src
       * @property {number} img_width
       * @property {number} img_height
       * @param { string | Picture[] } content
       */
      ```
  - `at_users`
    - 转发时[at]的用户
    - `AtInfo[]`
      ```js
      /**
       * @typedef {string} NickName
       * @typedef {number} UID
       * @typedef {(NickName | UID)[]} AtInfo
       */
      ```
  - `blacklist`
    - 防钓鱼uid黑名单
    - 逗号分割字符串
  - `blockword`
    - 屏蔽词
    - `string[]`
  - `followWhiteList`
    - 取关白名单
    - 逗号分割字符串
  - `relay`
    - 转发评语
    - `string[]`
  - `chat`
    - 评论内容
    - `string[]`
    - 若此项不为长度大于0的数组, 则使用转发评语
  - `UIDs`
    - 监听的UID列表
    - `number[]`
  - `TAGs`
    - 监听的抽奖话题
    - `string[]`
  - `partition_id`
    - 抽奖UP用户分组id
    - `number`
  - `is_exception`
    - 是否关注异常
    - `boolean`
  - `clear_partition`
    - 取关分区
    - `string`
  - `clear_max_day`
    - 清理多少天内的动态或关注
    - `number`
  - `clear_remove_dynamic`
    - 是否移除动态
    - `boolean`
  - `clear_remove_attention`
    - 是否移除关注
    - `boolean`
  - `clear_remove_delay`
    - 清除动态延时(毫秒)
    - `number`
  - `clear_dynamic_type`
    - 清除动态类型
      | 动态类型   | type值 |
      | ---------- | ------ |
      | 无         | `0`    |
      | 转发       | `1`    |
      | 含图片     | `2`    |
      | 无图纯文字 | `4`    |
      | 视频       | `8`    |
      | 专栏       | `64`   |
      | 活动       | `2048` |
    - `number`
  
  </details>

### 自定义设置
  - **默认设置**存放于[config.js](lib/config.js)和[script.js](lib/Script.js)中
  - 修改默认设置(非必要)
    - 本地运行 => 在项目根目录下新建my_config.json文件将设置填在其中
  - 填入符合[JSON语法](https://www.w3school.com.cn/json/json_syntax.asp)的内容
  - 字段的名称和对应的值按照[字段解释](#模式选择)要求填写
  - 多账号的设置  
    分别存储于键`"config_1"``"config_2"`...`"config_n"`中, 例如
    ```json
    {
      "config_1": {
          "model": "00"
      },
      "config_2": {
          "model": "11"
      }
    }
    ```
  - [自定义设置模板](https://github.com/shanmite/LotteryAutoScript/issues/62#issuecomment-808882833)

<!-- 关于如何在GitHub Actions中运行 请查看历史提交记录 -->