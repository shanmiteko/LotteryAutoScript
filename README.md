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
    - [检测中奖](#检测中奖)
      - [手动检查](#手动检查)
      - [微信推送(可选)](#微信推送可选)
        - [Server酱](#server酱)
        - [pushplus](#pushplus)
    - [运行](#运行)
    - [完成!](#完成)
  - [清理动态](#清理动态)
  - [其他细节](#其他细节)
    - [更新](#更新)
    - [自动更新](#自动更新)
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

此脚本将在B站专栏草稿中储存转发过的动态id以防止重复转发  

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

4. 新建一个COOKIE将获取到的`DedeUserID=***;SESSDATA=***;bili_jct=***`填入  

![new secret](.github/cookie2.png)  

![new COOKIE](.github/new_secret.png)  

也可以采用**其他方式获取**所需的Cookie  
只需含有 `DedeUserID=...;SESSDATA=...;bili_jct=...` 三项即可  
(分号分割，顺序随意)  

↓↓  

### 检测中奖  
每两个小时检测一次  
通过`@`信息判断  
通过私信判断(奖|中奖|地址|支付宝|账号|收款码)  
*关键词有限 可能会有漏掉的或误报*

#### 手动检查  
手动触发`Automatic check`工作流后可在日志中查看
![check](.github/check.png)
#### 微信推送(可选)  
##### Server酱  

> [Server酱是什么?](http://sc.ftqq.com/3.version)  

在 `Repository secrets` 中新建一个 `SCKEY` 并填入对应的值  

![new secret SCKEY](.github/serverchan.png)  

##### pushplus  

> [pushplus是什么?](https://pushplus.hxtrip.com/index)  

在 `Repository secrets` 中新建一个 `PUSH_PLUS_TOKEN` 并填入对应的值  

![new secret PUSH_PLUS_TOKEN](.github/push+.png)  

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

---

## 其他细节  

### 更新  

如果出现  

![滞后](.github/behind.png)  

说明此脚本有更新  
通过 `Pull Request` 更新仓库  
**注意PR的方向 如下图**
![如何同步更新Github上Fork的项目](.github/update_fork.png)  

或者  
使用[GitHub App Pull](https://github.com/apps/pull)自动同步

### 自动更新
*须知*  
> This will force sync ALL branches to match source repo. Branches that are created only in the destination repo will not be affected but all the other branches will be hard reset to match source repo.  
> ⚠️ This does mean if upstream ever creates a branch that shares the name, your changes will be gone.  

1. 点我创建 [`授权令牌`](https://github.com/settings/tokens/new)

2. 如图，勾选前两项即可：

![如图，勾选前两项即可：](.github/create_pat.png)

3. 将 令牌 复制（注意，先复制，一旦关闭网页就不能查看了），再新建`Secrets`，键名 填入 `PAT`

4. 每天与主仓库自动同步一次！

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
      node-version: '12.18.3'
  - name: 'Run in Nodejs'
    shell: bash
    env:
      NUMBER: *
      COOKIE: ${{ secrets.COOKIE* }}
    run:
      npm start
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
        node-version: '12.18.3'
    - name: 'Run in Nodejs'
      shell: bash
      env:
        NUMBER: *
        COOKIE: ${{ secrets.COOKIE* }}
      run:
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
        node-version: '12.18.3'
    - name: 'Run in Nodejs'
      shell: bash
      env:
        NUMBER: *
        COOKIE: ${{ secrets.COOKIE* }}
      run:
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