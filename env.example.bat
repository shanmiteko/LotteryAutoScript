@REM 下载代码到本地
@REM 安装node(http://nodejs.cn/download/)

@REM for windows
@REM 此批处理脚本为本地运行代码前设置环境变量时所需
@REM 使用时先将本文件名改成env.bat
@REM 填入相应的值
@REM 需注意 % 要转义为 %%
@REM npm install
@REM npm run test_start 启动脚本
@REM npm run test_check 检查是否中奖(只查看两个小时内的奖)
@REM npm run test_clear 清空动态和关注
@REM 运行成功后在lib文件夹下会生成一个GlobalVar.json文件
@REM 换参数时须先将GlobalVar.json文件删除
@REM 如果要运行多账号只能复制本项目并依次独立运行
set COOKIE=
set NUMBER=1
set CLEAR=true
set SCKEY=
set PUSH_PLUS_TOKEN=
set LOCALLAUNCH=true