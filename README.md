# AutoScript

![Automatic sweepstakes](https://github.com/shanmite/LotteryAutoScript/workflows/Automatic%20sweepstakes/badge.svg)

  

![Automatic check](https://github.com/shanmite/LotteryAutoScript/workflows/Automatic%20check/badge.svg)

  

![Automatic clear dynamic&follow](https://github.com/shanmite/LotteryAutoScript/workflows/Automatic%20clear%20dynamic&follow/badge.svg)

  

![Automatic sync](https://github.com/shanmite/LotteryAutoScript/workflows/Automatic%20sync/badge.svg)

  

<!-- TOC -->

- [AutoScript](#autoscript)
  - [动态抽奖](#动态抽奖)
  - [操作步骤](#操作步骤)
    - [Fork本仓库](#fork本仓库)
    - [填入COOKIE](#填入cookie)
    - [防重复转发](#防重复转发)
    - [检测中奖](#检测中奖)
      - [手动检查](#手动检查)
      - [中奖推送(可选)](#中奖推送可选)
    - [运行](#运行)
    - [完成!](#完成)
  - [清理动态](#清理动态)
  - [其他细节](#其他细节)
    - [更新](#更新)
    - [自动更新](#自动更新)
    - [本地运行](#本地运行)
    - [多账号支持](#多账号支持)
    - [如何关闭](#如何关闭)
    - [部分设置说明](#部分设置说明)
      - [定时运行(`UTC+0`)](#定时运行utc0)
      - [模式选择](#模式选择)
      - [自定义设置](#自定义设置)

<!-- /TOC -->


---

## 动态抽奖  

通过Github Actions挂载Nodejs脚本  

  > [Actions官方文档](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions)  

注意: Github Actions最大运行时间为6小时,超时会被强制关闭

[油猴版本](https://greasyfork.org/zh-CN/scripts/412468)  

---

## 操作步骤  

<kbd>★ Star</kbd>  

↓↓  

### Fork本仓库  

![fork](.github/fork.png)

↓↓  

### 填入COOKIE  

进入[B站主页](https://www.bilibili.com/)获取Cookie用于登录  
Chrome浏览器:  

1. `F12`打开控制台  
2. 进入Application找到Cookies栏中的SESSDATA将HttpOnly选项**取消**勾选  

    (此步骤是为了方便后续采用JS获取Cookies)  

![取消httponly](.github/getCookies.png)

3. 在Console中复制以下代码回车  

    ```js
    {
        let bilicookie = '';
        document.cookie.split(/\s*;\s*/).forEach(item => {
            const _item = item.split('=');
            if (['DedeUserID', 'bili_jct', 'SESSDATA'].indexOf(_item[0]) !== -1)
                bilicookie += `${_item[0]}=${_item[1]}; `;
        })
        copy(bilicookie); /* 自动复制到粘贴板 */
        console.log(bilicookie)
    }
    ```

4. 进入你Fork的GitHub仓库  
  `Settings` => `Secrets` => 新建一个`Repository secrets`COOKIE将获取到的`DedeUserID=***;SESSDATA=***;bili_jct=***`填入  

> 此处页面可能会有所不同,不用在意  

![new secret](.github/cookie2.png)  

![new COOKIE](.github/new_secret.png)  

也可以采用**其他方式获取**所需的Cookie  
只需含有 `DedeUserID=...;SESSDATA=...;bili_jct=...` 三项即可  
(分号分割，顺序随意)  

↓↓  

### 防重复转发
~~此脚本将在B站专栏草稿中储存转发过的动态id以防止重复转发~~  
运行结束后会将转发过的动态上传至构件(`Artifacts`)  
为了能够从构件中下载文件，需要access token权限  

1. 点我创建 [`授权令牌`](https://github.com/settings/tokens/new)

2. 如图，勾选前两项即可：

![如图，勾选前两项即可：](.github/create_pat.png)

3. 将 令牌 复制（注意，先复制，一旦关闭网页就不能查看了），再新建`Secrets`，键名 填入 `PAT`

↓↓  

### 检测中奖  
每两个小时检测一次  
> 脚本只会推送两小时内的中奖通知  

- 通过`@`信息判断  
- 通过私信判断  

*关键词有限 可能会有**漏掉**的或**误报***

#### 手动检查  
手动触发`Automatic check`工作流后可在日志中查看
![check](.github/check.png)
#### 中奖推送(可选)  
> 例如在 `Repository secrets` 中新建一个 `SCKEY` 并填入对应的值  
> ![新建repository secrets](.github/serverchan.png)  

以下是详细说明

|       Name        |                                        归属                                        | 属性   | 说明                                                                                                                                                                                                                        |
| :---------------: | :--------------------------------------------------------------------------------: | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|      `SCKEY`      |                         微信server酱推送(将在2021/4月下线)                         | 非必须 | server酱的微信通知[官方文档](http://sc.ftqq.com/3.version)                                                                                                                                                                  |
|     `SENDKEY`     |                             微信server酱(Turbo版)推送                              | 非必须 | [获取SENDKEY](https://sct.ftqq.com/sendkey) [选择消息通道](https://sct.ftqq.com/forward)                                                                                                                                    |
|    `BARK_PUSH`    | [BARK推送](https://apps.apple.com/us/app/bark-customed-notifications/id1403753865) | 非必须 | IOS用户下载BARK这个APP,填写内容是app提供的`设备码`，例如：https://api.day.app/123 ，那么此处的设备码就是`123`，再不懂看 [这个图](.github/bark.jpg)（注：支持自建填完整链接即可）                                            |
|   `BARK_SOUND`    | [BARK推送](https://apps.apple.com/us/app/bark-customed-notifications/id1403753865) | 非必须 | bark推送声音设置，例如`choo`,具体值请在`bark`-`推送铃声`-`查看所有铃声`                                                                                                                                                     |
|  `TG_BOT_TOKEN`   |                                    telegram推送                                    | 非必须 | tg推送(需设备可连接外网),`TG_BOT_TOKEN`和`TG_USER_ID`两者必需,填写自己申请[@BotFather](https://t.me/BotFather)的Token,如`10xxx4:AAFcqxxxxgER5uw` , [具体教程](.github/TG_PUSH.md)                                           |
|   `TG_USER_ID`    |                                    telegram推送                                    | 非必须 | tg推送(需设备可连接外网),`TG_BOT_TOKEN`和`TG_USER_ID`两者必需,填写[@getuseridbot](https://t.me/getuseridbot)中获取到的纯数字ID, [具体教程](.github/TG_PUSH.md)                                                              |
|  `TG_PROXY_HOST`  |                                 Telegram 代理的 IP                                 | 非必须 | 代理类型为 http。例子：http代理 http://127.0.0.1:1080 则填写 127.0.0.1                                                                                                                                                      |
|  `TG_PROXY_PORT`  |                                Telegram 代理的端口                                 | 非必须 | 例子：http代理 http://127.0.0.1:1080 则填写 1080                                                                                                                                                                            |
|  `DD_BOT_TOKEN`   |                                      钉钉推送                                      | 非必须 | 钉钉推送(`DD_BOT_TOKEN`和`DD_BOT_SECRET`两者必需)[官方文档](https://ding-doc.dingtalk.com/doc#/serverapi2/qf2nxq) ,只需`https://oapi.dingtalk.com/robot/send?access_token=XXX` 等于`=`符号后面的XXX即可                     |
|  `DD_BOT_SECRET`  |                                      钉钉推送                                      | 非必须 | (`DD_BOT_TOKEN`和`DD_BOT_SECRET`两者必需) ,密钥，机器人安全设置页面，加签一栏下面显示的SEC开头的`SECXXXXXXXXXX`等字符 , 注:钉钉机器人安全设置只需勾选`加签`即可，其他选项不要勾选,再不懂看 [这个图](.github/DD_bot.png)     |
|  `IGOT_PUSH_KEY`  |                                      iGot推送                                      | 非必须 | iGot聚合推送，支持多方式推送，确保消息可达。 [参考文档](https://wahao.github.io/Bark-MP-helper )                                                                                                                            |
|     `QQ_SKEY`     |                                酷推(Cool Push)推送                                 | 非必须 | 推送所需的Skey,登录后获取Skey [参考文档](https://cp.xuthus.cc/)                                                                                                                                                             |
|     `QQ_MODE`     |                                酷推(Cool Push)推送                                 | 非必须 | 推送方式(send或group或者wx，默认send) [参考文档](https://cp.xuthus.cc/)                                                                                                                                                     |
|    `QYWX_KEY`     |                                    企业微信推送                                    | 非必须 | 密钥，企业微信推送 webhook 后面的 key [详见官方说明文档](https://work.weixin.qq.com/api/doc/90000/90136/91770)                                                                                                              |
| `PUSH_PLUS_TOKEN` |                                    pushplus推送                                    | 非必须 | 微信扫码登录后一对一推送或一对多推送下面的token(您的Token) [官方网站](http://pushplus.hxtrip.com/)                                                                                                                          |
| `PUSH_PLUS_USER`  |                                    pushplus推送                                    | 非必须 | 一对多推送的“群组编码”（一对多推送下面->您的群组(如无则新建)->群组编码）注:(1、需订阅者扫描二维码 2、如果您是创建群组所属人，也需点击“查看二维码”扫描绑定，否则不能接受群组消息推送)，只填`PUSH_PLUS_TOKEN`默认为一对一推送 |

↓↓  

### 运行  

进入Actions启用工作流  

通过手动触发  

![commit](.github/byhand.png)  

***以上步骤是为了检测是否配置成功***

至此程序将会每**三小时运行**一次  

↓↓  

### 完成!  

效果  

![效果](.github/success.png)  

---

## 清理动态

只需在 `Secret` 里添加一个 `CLEAR` 项并取值为 `true`

程序便会每30天清理一次动态和关注  

注: 短时大量清理动态会导致动态数显示异常  

---

## 其他细节  

### 更新  

如果出现  

![滞后](.github/behind.png)  

说明此脚本有更新  
通过 `Pull Request` 更新仓库  
**注意PR的方向 如下图**
![如何同步更新Github上Fork的项目](.github/update_fork.png)  


### 自动更新
*须知*  
> This will force sync ALL branches to match source repo. Branches that are created only in the destination repo will not be affected but all the other branches will be hard reset to match source repo.  
> ⚠️ This does mean if upstream ever creates a branch that shares the name, your changes will be gone.  

每天与主仓库自动同步一次!  

如需关闭请手动关闭  

或者使用[GitHub App Pull](https://github.com/apps/pull)自动同步

### 本地运行
由于Github服务器共用IP导致脚本易发生访问频繁,可选择在本地运行  
详见[env.example.bat](env.example.bat)文件

### 多账号支持
默认支持5个账号  
  | cookies   | value |
  | --------- | ----- |
  | `COOKIE`  | 值    |
  | `COOKIE2` | 值    |
  | `COOKIE3` | 值    |
  | `COOKIE4` | 值    |
  | `COOKIE5` | 值    |
  | `COOKIE*` | 值    |

*添加更多的账号*  
可在文件`.github/workflows/node.js.yml`中  
将以下代码中的三处星号(`*`)改为数字并依次复制粘贴  
```yaml
lottery_*:
runs-on: ubuntu-latest
steps:
  - name: 'Checkout codes'
    uses: actions/checkout@v2
  - name: 'Use Node.js'
    uses: actions/setup-node@v1
    with:
      node-version: '14.15.5'
  - name: 'Run in Nodejs'
    shell: bash
    env:
      NUMBER: *
      COOKIE: ${{ secrets.COOKIE* }}
    run: |
      npm install
      npm start
  - name: 'Upload dyid to artifact'
    uses: actions/upload-artifact@v2
    with:
      name: dyid.txt
      path: lib/dyid.txt
```  
此时`Secrets`里就可以添加更多的`COOKIE*`(简单的找规律问题)  

同理须在文件`.github/workflows/check.yml`中  
将以下代码中的三处星号(`*`)改为数字并依次复制粘贴(启用对应的中奖检测)  
```yaml
lottery_*:
  runs-on: ubuntu-latest
  steps:
    - name: 'Checkout codes'
      uses: actions/checkout@v2
    - name: 'Use Node.js'
      uses: actions/setup-node@v1
      with:
        node-version: '14.15.5'
    - name: 'Run in Nodejs'
      shell: bash
      env:
        NUMBER: *
        COOKIE: ${{ secrets.COOKIE* }}
      run: |
        npm install
        npm run check
```

若使用**自动清理**功能,还需再`.github/workflows/clear.yml`中  
```yaml
lottery_*:
  runs-on: ubuntu-latest
  steps:
    - name: 'Checkout codes'
      uses: actions/checkout@v2
    - name: 'Use Node.js'
      uses: actions/setup-node@v1
      with:
        node-version: '14.15.5'
    - name: 'Run in Nodejs'
      shell: bash
      env:
        NUMBER: *
        COOKIE: ${{ secrets.COOKIE* }}
      run: |
        npm install
        npm run clear
```  
将以上的三处星号(`*`)改为数字并依次复制粘贴以清理更多的账号  

### 如何关闭
![关闭工作流](.github/close.png)  

### 部分设置说明  
#### 定时运行(`UTC+0`)  
  `.github/workflows/node.js.yml`  
  ```yaml
  schedule:
    - cron: '0 */2 * * *'
  ```  
  [如何填写此字段](https://crontab.guru/)  
#### 模式选择  
  `lib/config.js`
  - 字段解释  
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
    - `maxday`
      - 开奖时间距离现在的最大天数
      - 默认为`-1`表示不限制
      - 字符串类型
    - `wait`
      - 转发间隔时间
      - 单位毫秒
      - 上下浮动30s
      - 字符串类型
    - `minfollower`
      - up主粉丝数限制
      - 仅限制没有官方认证的up
      - 字符串类型
    - `only_followed`
      - 只转发已关注的
      - `'1'`开启
      - `'0'`关闭
    - `create_dy`
      - 是否发送随机动态(防止被开奖机过滤)
      - `'1'`开启
      - `'0'`关闭
    - `blacklist`
      - 防钓鱼uid黑名单
      - 逗号分割字符串
    - `blockword`
      - 屏蔽词
      - 字符串数组
    - `followWhiteList`
      - 取关白名单
      - 逗号分割字符串
    - `relay`
      - 转发评语
      - 字符串数组
    - `chat`
      - 评论内容
      - 字符串数组
#### 自定义设置  
  - 新建一个Repository secrets取名为`MY_CONFIG`
  - 填入符合[JSON语法](https://www.w3school.com.cn/json/json_syntax.asp)的内容
  - 字段的名称和对应的值按照[字段解释](#模式选择)要求填写
  - 需要修改哪项就填入相应的键值对  
    > 例如我要将`model`值改为`'00'`就在MY_CONFIG里填入  
    > ```json
    > {
    >   "model":"00"
    > }
    > ```

---