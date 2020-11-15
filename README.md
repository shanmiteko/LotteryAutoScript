# AutoScript
## 动态抽奖  
通过Github Actions挂载Nodejs脚本  
> [Actions官方文档](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions)

默认整点运行,只转发非官方抽奖
## 操作步骤
1. fork本仓库  

2. 填入COOKIE  
    > [在浏览器中获取指定站点的Cookies的方法](https://blog.csdn.net/Luckyzhoufangbing/article/details/89816069)  

    (COOKIE格式:`DedeUserID=;·SESSDATA=;·bili_jct=;·`(点号表示空格 **注意顺序与空格要求**))  
    ![步骤1](https://ftp.bmp.ovh/imgs/2020/11/c4e7ac036199551c.png)
    ![步骤2](https://ftp.bmp.ovh/imgs/2020/11/dcc3f30e22f6b12a.png)

3. 随便改一下再作一次提交便自动运行  
## 效果
![效果](https://ftp.bmp.ovh/imgs/2020/11/87d483cea98563fa.png)

