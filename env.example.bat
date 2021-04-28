chcp 65001
:: 1.运行环境配置
:: 下载代码到本地 https://github.com/shanmite/LotteryAutoScript/archive/refs/heads/main.zip
:: 安装Node.js http://nodejs.cn/download

:: 2.环境变量配置
:: 此批处理脚本为本地运行代码前设置环境变量时所需
:: 使用时先将本文件名改成env.bat
:: 填入相应的值
set COOKIE=
set NUMBER=1
set CLEAR=
set LOCALLAUNCH=true
set CLEAR=true
:: 以下是推送所需环境变量(可不填)
set SCKEY=
set SENDKEY=
set QQ_SKEY=
set QQ_MODE=
set BARK_PUSH=
set BARK_SOUND=
set TG_BOT_TOKEN=
set TG_USER_ID=
set TG_PROXY_HOST=
set TG_PROXY_PORT=
set DD_BOT_TOKEN=
set DD_BOT_SECRET=
set QYWX_KEY=
set IGOT_PUSH_KEY=
set PUSH_PLUS_TOKEN=
set PUSH_PLUS_USER=
set SMTP_HOST=
set SMTP_PORT=
set SMTP_USER=
set SMTP_PASS=
set SMTP_TO_USER=

:: 2.运行
:: 在当前目录下新建一个start.bat
:: 填入 npm run test_start 启动脚本
:: 填入 npm run test_check 检查是否中奖
:: 填入 npm run test_clear 清空动态和关注
:: 点击start.bat即可启动

:: 3.注意事项
:: 运行成功后在lib文件夹下会生成一个GlobalVar.json文件和dyid.txt文件
:: ==换参数时须先将GlobalVar.json文件删除==
:: ==注意运行时请去掉注释==
:: ==注意 % 要转义为 %%==
:: 如果要运行多账号只能复制本项目并依次独立运行
:: 在lib/Public.js文件getLotteryInfoByTag方法和getLotteryInfoByUID方法中可适当增大扫描范围 默认3页