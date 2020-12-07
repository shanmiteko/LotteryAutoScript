# AutoScript
## 动态抽奖  
通过Github Actions挂载Nodejs脚本  
> [Actions官方文档](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions)

---

## 操作步骤
1. fork本仓库  

2. 填入COOKIE  
    >具体获取Cookie的方法参考[BILIBILI-HELPER](https://github.com/JunzhouLiu/BILIBILI-HELPER)
    
    COOKIE格式如下:  
    `DedeUserID=填入此处;·SESSDATA=填入此处;·bili_jct=填入此处;·`  
    (**点号**表示一个**空格**实际填写时**须去掉** 注意**顺序与空格**要求)  
    ![步骤1](https://ftp.bmp.ovh/imgs/2020/11/c4e7ac036199551c.png)
    ![步骤2](https://ftp.bmp.ovh/imgs/2020/11/dcc3f30e22f6b12a.png)

3. 如果想使用Server酱提供的**微信推送**服务请用同样的方法填入`SCKEY`  
    > [Server酱是什么?](http://sc.ftqq.com/3.version)  

4. 随便改一下`README.md`文件再作一次提交便自动运行  

---

## 效果
![效果](https://ftp.bmp.ovh/imgs/2020/11/87d483cea98563fa.png)  

---

## 部分设置说明
- 定时运行(`UTC`时间)
    ```yaml
    schedule:
      - cron: '0 */2 * * *'
    ```
    > [填写格式](https://crontab.guru/)  
- 模式选择
    ```javascript
    /**
     * 默认设置
     */
    let config = {
        model: '11',/* both */
        chatmodel: '11',/* both */
    }
    ```
    [具体含义](https://github.com/shanmite/LotteryAutoScript/issues/2)

---

