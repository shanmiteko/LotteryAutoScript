<!-- markdownlint-disable MD036 MD024-->
# CHANGELOG
## 主要变化(2.9.7)
* bcf87a9 feat: 新增日志等级Notice (#454)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.9.6)
* f261e91 fix: API.X_POLYMER_WEB_DYNAMIC_V1_DETAIL 缺少参数 (#452)
* 5336068 fix: 修复通过uid监视转发抽奖动态 (#449)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.9.5)
* f5f63bc fix: 官方抽奖判断未获取到内容 (#445)
* 1832f6d feat: 增加多账号的代理 (#433)
* 717d8cf fix: 换源gitlab

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.9.4)
* 2f5990f fix: 动态ID字符串长度超过18

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.9.3)
* 1d4e8ea fix: 专栏获取为空 (#425)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.9.2)
* 4134190 fix: 分区移动失败继续运行 (#423)
* 66fa06f fix: 源动态禁止转发
* b1de122 fix: 验证码识别失败无限重试
* d3475a5 feat(notify.js): QYWX推送变为图文消息 (#416)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.9.1)
* 9b0f9bf fix: 仅屏蔽自动回复 (#401)
* 74337ca fix: 账号转发动态途中被系统强制登出，任务直接终止 (#392)
* 6c75d57 lint: eslint
* e723136 feat:  可自定义验证码识别API

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.9.0)
* 1e7d8b2 feat: 动态详情新老api共存
* fc41750 fix: 源rid_str获取
* 1a08c0a fix: 话题uid动态获取使用老解析函数
* 666c057 feat: 使用新接口替换动态详情老接口 (#382)
* df3e97d ci: fix "an artifact with this name already exists on the workflow run"

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.19)
* d9f6bf2 feat: 中奖检测屏蔽自动回复 (#381)
* ded981e fix: 动态卡片解析出错导致程序停止
* 93d3727 fix: searcher.js typo fix (#379)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.17)
* 60e211e fix: 读取uid出错 (#369)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.17)
* 5b33ae3 fix: 读取uid出错 (#369)
* 7e4650c feat: env可自定义UA (#371)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.16)
* 469a6dc fix: add getOneDynamicByDyid v1

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.15)
* 7b6356a fix:  风控导致动态全为过时
* d337fb2 fix: 查询动态详情的接口失效 (#349)
* d9dba6f fix: Cannot read properties of null (reading 'is_liked')
* eafa7c7 fix:  Cannot read properties of null (reading 'length') (#360)
* e2976cc docs: 文档更新cookie获取方式 (#357)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.14)
* f5bdd28 fix: update api getOneDynamicByDyid
* cb6fad0 fix: get_dynamic_detail api  (#351)
* 780a3a9 fix: update get_dynamic_detail api (#350)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.13)
* addb9c6 fix: ghproxy.com->mirror.ghproxy.com (#333)
* b86e756 fix: at错位

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.12)
* 5d30178 ci: docker构建
* 0c61070 fix: 评论并转发 (#259)
* 6dfee7e fix: 出现帐号未登录错误时自动跳转下一个帐号

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.11)
* 6496a8f fix: fs.close

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.10)
* e32c3c9 fix: 已经关注用户未转发
* 3bd77b3 fix: fs.close

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.9)
* 588feba docs: update readme
* 5d5858f fix: 无法已读未关注未读私信
* 1526519 docs: 添加gotify推送说明
* 69c297e feat: 添加Gotify推送
* 2017705 feat: autoAttention API增加对重复关注的处理
* 16c113f docs: update readme

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.8)
* 54af844 fix: 专栏无法获取

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.7)
* 62768dd fix: 修改win脚本
* 101df0a fix: login等待时间过长
* f8829b5 fix: 清理动态检索动态延时

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.6)
* 83e19d4 docs: 扫码登陆使用说明
* c238c27 fix：多账号login添加时延进行间隔
* 8addc90 fix：登录跳过执行正常状态的账号
* 288851b feat: 扫码登录获取移动端的CK更新账号,带sid可减小掉号频率
* ddcfcee fix: 移除公共黑名单设置

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.5)
* 0024b19 feat: 移除远程设置启用自动更新

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.4)
* 9ab605a feat: 新增本地dyids抽奖新信息获取方式 (#311)(#287)
* a83c5ab fix: extend_json undefined

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.3)
* 2f2eaab fix: 预约抽奖包月抽奖识别异常 (#288)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.2)
* 3825be4 feat: 查看帐号信息
* 248c78d feat: 快速移除关注模式新增粉丝数限制 (#305)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.1)
* d44981b fix: 随机cookie参数buvid3
* 3bfc93f fix: 目前回复无法正常推送 (#302)
* ef8366b fix: tg推送代理设置出错 (#298)
* a7e31b4 docs: update
* f4f45c5 fix: cookie参数buvid3错误导致专栏获取滞后

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.8.0)
* 2f935bb chore: update env.js
* eec22ff feat: 验证码自动识别
* 909fb83 chore: update qinglong script
* 41b0369 ci: fix pkg.yml

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.7.11)
* 5a3c16d fix: 专栏获取内容不正确，需要排除推荐内容 (#293)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.7.10)
* 29645bc fixed: 话题搜索功能已失效 #285
* d950a59 fix: is_imitator导致错误评论

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.7.9)
* 3828a0f fix: Cannot read properties of null (#284)
* 67313f4 feat: 专栏里的动态链接识别优化 (#283)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.7.8)
* ad6af97 feat: 专栏短链接识别 (#263)
* b6c56c5 feat:  取关分区支持设置多分区 (#281)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.7.7)
* 2426fe2 fix: 动态详情获取接口412频繁 (#279)
* d370fef fix: 获取动态详情出现undefined (#271)
* 00174b0 fix(monitor): L615

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.7.6)
* 881923b fix: 开奖时间和粉丝数判断逻辑 (#253)
* 097e2d6 fix: 筛选掉置顶的评论，与该动态UP的评论 (#252)
* 82d285e fix:  充电专属动态 (#251)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.7.5)
* 9c9bc18 fix:  查询评论报错 (#250)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.7.4)
* 0630c89 feat: 新增设置抄热评屏蔽词 (#239)
* 7b9d251 feat: 热评包含发送热评的人的昵称换成自己的昵称 (#239)
* 5ae7801 fix: 带话题正则修改
* 0ab5ec0 feat: 未知错误不重试
* 50c22a4 fix: 账号异常点赞失败 (#247)
* 8ac7466 fix: 未知错误 已赞过 (#249)
* 7f6188d feat: UID保护列表输出调整为debug级
* 2ad128c docs: change LICENSE
* e945be4 feat: 检测docker是否已安装，未安装则预先安装docker
* bfdbc7a fix: /bin/env path error

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.7.3)
* d13c0a5 docs: 添加设置修改说明
* 9615d25 fix: 预约抽奖转发 (#240)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.7.2)
* af8c4a6 feat: 新增推送pushdeer (#236)
* c1ca2b6 fix: 关键词筛选重复且影响官抽

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.7.1)
* 92f1ad2 fix: 自动评论没有正确评论所有抽奖 (#235)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.7.0)
* c84cb3f feat:  评论内容从评论区随机获取 (#134)
* 4fa6d9a feat: 可关闭预约抽奖转发 (#196)
* 0814154 feat:  关注分区移动可关闭 (#228)
* 5097f2a feat: 清理动态时显示UID保护列表 (#229)
* cb08e7a feat: 过滤掉充电包月抽奖 (#224)
* 7b5a177 refactor: 调整推送格式 (#223)
* 63b550e ci(mirror): shallow update not allowed

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.6.9)
* 28fc79e fix: 通知内不显示抽奖信息
* 9e6fe66 fix: free `log._cache`
* 5b50611 ci: update actions

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.6.8)
* 847e680 feat: 丰富推送内容(#135)(#194)(#211)
* 8bf5070 fix: `flatMap` is not a function (#218)
* 727883a feat:  推送`NOTE` (#221)
* fd33478 fix: 微信企业应用推送未配置出错 (#220)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.6.7)
* db7ba49 style: 修改通知格式
* b518828 feat: 新增企业微信应用推送 (#217)
* e0a8ce5 doc: update image

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.6.6)
* 92f7003 perf: monochrome
* 8e77afa fix: `fs.uninkSync` returns before remove finish
* bfc8fb6 ci: gitlab mirror `workflow_dispatch`

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.6.5)
* 47e09a1 ci: arm64 added, and optimized
* b91a4f9 fix: `fs.rm` node12
* d9cecbe ci: push shanmite/pkg-arm64
* 989f836 ci: 修改github release镜像源

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.6.4)
* a363b4e ci: 关闭`arm64`自动打包
* c220ff5 feat(多账号优化): 抽奖信息本地保存 (#209)
* 2b6cc8d feat: 每条运行结果后面加上当前账号序列号 (#206)
* 856dd79 fix: 增加获取关注上限(#207)
* 4683002 fix: 青龙执行脚本时出错(#202)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.6.3)
* ca1acd2 fix: 转发随机动态视频新的错误码(#201)
* dabf8f9 fix:  关注出错(#199)
* affe24f fix: 发布随机动态显示转发请求不合法(#197)
* 3a5a8d0 feat: 青龙面板(#200)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.6.2)
* 7ab38f2 feat: 弃用`update_loop_wait`(#180)
* 35fe448 feat: 预约抽奖参与间隔`reserve_lottery_wait`(#191)
* 58edd41 fix: 该动态不能转发分享(#189)
* c8e1a32 fix:  关注UP主7天以上的人可发评论(#192)
* 4f8f50f ci: docker
* 3b4b85b ci: pkg
* db11265 docker: change sh to bash

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.6.1)
* 82efbb4 ci: pkg arm64 use podman
* 886ccff fix: cookie缺少`buvid3`导致412(#182)(#185)
* 0d5f5ec ci(docker): support more platforms
* f75d2b6 fix: `checkAllDynamic`重试与`null`检测
* 29bf439 fix: 中途掉号账号未登录(#179)
* d3a8b86 fix: 重复评论(#184)
* d205cb5 fix: 未知错误1004(#175)
* 223a6e1 fix: 获取推荐412(#182)

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.6.0)
* 5a7b672 fix: `LotteryOrder`设置(#176)
* aae3de8 fix: 仅在评论需要验证码时退出(#175)
* 3491888 feat: 抽奖顺序可调`LotteryOrder`(#176)
* f6aa0d0 fix: 未知错误带状态码(#175)
* 1415f18 fix: 无屏蔽词时全屏蔽

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.5.9)
* 292b8e0 fix: 动态数据为null时异常退出
* ca6549d feat:  程序在请求多次输入验证码时切换下一个账号 (#167)
* e03b483 fix: 远程设置换源gitee
* 3e01e42 feat: 预约抽奖奖品屏蔽词 (#159)
* 00b5310 feat: 自动点赞且检索本地(#162)
* ba100e0 docs: 更新docker运行说明(#160)
* 29676d5 ci: mirror to gitlab
* dd9ff1b docs: 修改changelog.sh使用http链接

_如果之前版本小于上一版本,请查看[CHANGELOG](https://github.com/shanmiteko/LotteryAutoScript/blob/main/CHANGELOG.md)变更说明_

## 主要变化(2.5.8)
* 4238ee5 fix: 预约验重(#158)

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.5.7)
* 607b2d7 feat: 新增设置`disable_reserve_lottery`
* 03e24b9 fix: `extend_json`中的`reserve`获取失败(#155)

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.5.6)
* 2742dcb feat: 清理动态加入错误重试(#140)
* 329c5e5 feat: 自动参与预约抽奖(#155)
* 3bc7daf doc: 图片换源gitlab

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.5.5)
* df7b321 fix: 远程设置换源gitlab

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.5.4)
* f329457 fix: 评论包含敏感词(#150)
* 0eddee4 Merge pull request #147 from spiritLHLS/patch-1
* ce2c9e5 Update README.md
* f1bbc9d Update README.md

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.5.3)
* 22e4d2a fix: 转发了不含关键词的抽奖动态(#136)
* 354d8cf fix: 推送异常(#132)

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.5.2)
* b1f478c  feat: 可选通知现阶段运行到哪个账号(#132)
  * 新增设置`notice_running_state`

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.5.1)
* 45ac58e fix: 评论与转发相同时去掉动态原文(#128)

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.5.0)
* 41b9540 fix: 未知错误退出

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.4.11)
* 3f59076 feat: 推送中奖检测可添加账号备注(#121)

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.4.10)
* f569207 fix: 低版本node(< v15)不支持replaceAll

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.4.9)
* 2fbd292 feat: 自动评语中可用up主昵称`${uname}`变量(#118)

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.4.8)
* 266ecf7 feat: 添加Qmsg酱推送(#115)
* 4d90d83 feat: 日志细节优化
* c56ec7a  merge: 更新readme(#110)

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.4.7)
* dd1b1db feat(update): 优先使用代理更新失败时切回去
* 86e6b7d feat: 重命名设置`sneaktower`(#104)

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.4.6)
* 043fee2 feat: 新增设置`sneaktopic`(#104)
* ae34c69 feat: 新增设置`is_repost_then_chat`(#103)
* 7496bc5 feat:  中奖检查时增加回复信息读取(#102)

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.4.5)
* ef969bb feat: 每组显示动态转发数(#97)
* 0cbacd6 feat: 推送携带帐号编号(#98)
* da75c8c feat: 增加设置屏蔽动态类型`block_dynamic_type`(#99)
* 548ad4b fix: pushplus更新域名(#93)

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.4.4)
* c486abf fix: 黑名单不起作用(#92)

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.4.3)
* aba17ed feat: 提示关键词修改建议
* 5a23043 feat: 只通过是否点赞判断时点赞
* 76f7152 fix: 黑名单匹配(#90)
* 0d4185d fix(Searcher): getLotteryInfoByUID(#89)

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.4.2)
* 20c423f fix: "公共黑名单"显示错误(#87)
* 6851f29 fix: 描述中出现undefined(#88)

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.4.1)
* 0ba6ace feat: check_if_duplicated可同时使用多种方式
* dd99426 fix: 只转已关注功能失效

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.4.0)
* 01562b6 ci: verison升级时小版本号归0
* 90ac347 docs: 更新README
* 3cf3939 feat: 新增设置`check_if_duplicated`
* d0a8aa9 feat: metainfo显示nodejs版本号
* 10db52f fix: 完善错误延时重试(#82)

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.3.9)
* b36c555 ci: auto gen changelog
* 7338e09 feat: 更新`notice_key_words`
* 80a54e8 ci: `*.exe` `latest_version0`
* 1a62914 feat: 新增设置`is_outof_maxfollow`(#80)
* 449c8d9 docs: update README

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

## 主要变化(2.3.8)
* 313942a ci: pkg.yml tag_name
* 66efd62 feat: 新增设置`use_public_blacklist`
* d7cf742 feat: 增加粉丝数查询第三方接口
* 094e019 fix: 二级转发带有效抽奖
* 8de7453 fix: description获取不到
* 70c10f2 fix: 更改默认设置`key_words` `blockword`
* 2f26a39 feat: 源uid参与筛选判断
## 较上一版本变化
* 变更可执行文件

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

**Full Changelog**: https://github.com/shanmiteko/LotteryAutoScript/compare/v2.3.7...v2.3.8

## 主要变化(2.3.7)
* 50e18e2 feat: 下载更新时有多个版本
* b9c73bd chore: change docker auto build
* 608b1fb pref: 增加筛选时日志输出(#79)
* 07ef8df chore: 移植并完善自动化构建脚本
* 6b09e26 chore: update docker init.sh
* 7babd57 docs: about docker
* 8b57a85 chore: pkg build
## 较上一版本变化
* 变更可执行文件

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

**Full Changelog**: https://github.com/shanmiteko/LotteryAutoScript/compare/v2.3.6...v2.3.7

## 主要变化(2.3.6)
* eae72db feat: minfollower填0可关闭本地粉丝数筛选
* 111602f perf: 日志显示是否转发过
* d366e25 fix:  转发动态时非限制性错误码(#72)
## 较上一版本变化
* 变更可执行文件

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

**Full Changelog**: https://github.com/shanmiteko/LotteryAutoScript/compare/v2.3.5...v2.3.6

## 主要变化(2.3.5)
* 8c0d96a refactor: 检测是否已经发送过随机动态(#71)
* 09b6db4 feat: 新增设置`check_session_pages`(#66)
## 较上一版本变化
* 变更可执行文件
* [my_config.js](my_config.example.js)增加
  - `check_session_pages` - 检查私信页数

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

**Full Changelog**: https://github.com/shanmiteko/LotteryAutoScript/compare/v2.3.4...v2.3.5

## 主要变化(2.3.4)
* 1962d97 fix: 过滤专栏时间失效(#67)
## 较上一版本变化
只变更可执行文件

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

**Full Changelog**: https://github.com/shanmiteko/LotteryAutoScript/compare/v2.3.2...v2.3.4

## 主要变化(2.3.3)
* 11625b3 feat: 检索专栏时能够根据发布时间进行过滤(#65)
* 8c7a6d1 fix: 多帐号设置未更新
## 较上一版本变化
[my_config.js](my_config.example.js)增加
* `article_create_time` - 专栏创建时间距离现在的最大天数

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

**Full Changelog**: https://github.com/shanmiteko/LotteryAutoScript/compare/v2.3.2...v.2.3.3

## 主要变化(2.3.2)

* b4c7a83 docs: 更新README
* 72b07a0 chore: 暂时去除打包到arm
* 4accd2d fix: 根据点赞去重(#64)
* d1c2c61 fix: 无法打包pkg_armv7
* 6b09711 feat: 获取和储存整理好的动态信息(#64)
## 较上一版本变化

[my_config.js](my_config.js)增加
* `APIs` - 获取抽奖信息的链接字符串
* `set_lottery_info_url` - 上传抽奖信息的链接字符串

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

**Full Changelog**: https://github.com/shanmiteko/LotteryAutoScript/compare/v2.3.1...v2.3.2

## 主要变化(2.3.1)

## 问题修复

- 该动态不能转发分享(#60)
- 发布的动态内容未序列化(#47)

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**替换可执行文件**

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

**Full Changelog**: <https://github.com/shanmiteko/LotteryAutoScript/compare/v2.3.0...v2.3.1>

## 主要变化(2.3.0)

- 私信检查所有未读消息

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**替换可执行文件**

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

**Full Changelog**: <https://github.com/shanmiteko/LotteryAutoScript/compare/v2.2.9...v2.3.0>

## 主要变化(2.2.9)

- 检查动态创建时间(#57)(#58)
- 简单整理(#56)

## 问题修复

- 非转发动态无源用户(#54)

## 较上一版本变化

- `env.js`无
- `my_config.js`增加`max_create_time`

**替换可执行文件和更改配置文件(建议修改)**

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

**Full Changelog**: <https://github.com/shanmiteko/LotteryAutoScript/compare/v2.2.8...v2.2.9>

## 主要变化(2.2.8)

- 遇到过期的cookie跳过(#51)

## 问题修复

- UP关闭评论区(#52)

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**替换可执行文件**

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

**Full Changelog**: <https://github.com/shanmiteko/LotteryAutoScript/compare/v2.2.7...v2.2.8>

## 主要变化(2.2.7)

## 问题修复

- 未移动分区(#50)
- 修改线路切换逻辑

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**替换可执行文件**

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

**Full Changelog**: <https://github.com/shanmiteko/LotteryAutoScript/compare/v2.2.6...v2.2.7>

## 主要变化(2.2.6)

- LOG日志显示随机动态内容(#47)
- 增加设置过滤间隔

## 较上一版本变化

- `env.js`无
- `my_config.js`增加`filter_wait`

**替换可执行文件和更改配置文件(建议修改)**

_如果之前版本小于上一版本,请查看[CHANGELOG](CHANGELOG.md)变更说明_

**Full Changelog**: <https://github.com/shanmiteko/LotteryAutoScript/compare/v2.2.5...v2.2.6>

## 主要变化(2.2.5)

## 问题修复

- 因黑名单而关注失败(#45)

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**替换可执行文件**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

**Full Changelog**: <https://github.com/shanmiteko/LotteryAutoScript/compare/v2.2.4...v2.2.5>

## 主要变化(2.2.4)

- api线路切换具有记忆功能
- 增加更多时延自定义值(#44)
- 重构部分代码
- 内置默认设置

## 问题修复

- 清理动态时关注列表获取失败

## 较上一版本变化

- `env.js`无
- `my_config.js`增加
  - `get_session_wait` 读取下一页私信间隔
  - `update_session_wait` 已读私信间隔
  - `get_partition_wait` 读取下一页关注列表间隔
  - `get_dynamic_detail_wait` 获取动态细节间隔
  - `random_dynamic_wait` 随机动态间隔

**替换可执行文件和更改配置文件(建议修改)**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

**Full Changelog**: <https://github.com/shanmiteko/LotteryAutoScript/compare/v2.2.3...v2.2.4>

## 主要变化(2.2.3)

- clear_dynamic_type类型可以多选(#42)

## 问题修复

- 番剧动态无user_profile(#41)

## 较上一版本变化

- `env.js`无
- `my_config.js`修改`clear_dynamic_type`

**替换可执行文件和更改配置文件(建议修改)**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

**Full Changelog**: <https://github.com/shanmiteko/LotteryAutoScript/compare/v2.2.2...v2.2.3>

## 主要变化(2.2.2)

- 随机转发热门视频(#40)

## 较上一版本变化

- `env.js`无
- `my_config.js`增加`create_dy_mode` `create_dy_type`

**替换可执行文件和更改配置文件(建议修改)**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

**Full Changelog**: <https://github.com/shanmiteko/LotteryAutoScript/compare/v2.2.1...v2.2.2>

## 主要变化(2.2.1)

- 动态不存在时出错(#39)

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**替换可执行文件**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

**Full Changelog**: <https://github.com/shanmiteko/LotteryAutoScript/compare/v2.2.0...v2.2.1>

## 主要变化(2.2.0)

- 修改转发验重逻辑
- 可间隔插入随机动态(#33)

## 较上一版本变化

- `env.js`无
- `my_config.js`增加create_dy_mode

**替换可执行文件和更改配置文件(建议修改)**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

## 主要变化(2.1.8)

- 设置支持热更新(#29)

## 较上一版本变化

- `env.js`文件格式更改
- `my_config.js`文件格式更改

**替换可执行文件和更改配置文件(建议修改)**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

## 主要变化(2.1.7)

- 设置支持热更新(#29)

## 较上一版本变化

- `env.js`文件格式更改
- `my_config.js`无

**替换可执行文件和更改env.js**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

## 主要变化(2.1.6)

- 新增设置not_check_article(#25)

## 较上一版本变化

- `env.js`无
- `my_config.js`新增设置not_check_article

**替换可执行文件和更改my_config.js**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

## 主要变化(2.1.5)

- 修复之前无法更新的问题

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**仅需替换可执行文件**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

## 主要变化(2.1.4)

- 黑名单处理(#22)

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**仅需替换可执行文件**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

## 主要变化(2.1.3)

- 错误码变更(#20)

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**仅需替换可执行文件**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

## 主要变化(2.1.2)

- 支持arm平台运行
- 改变账号异常应对策略
- 修改dingtalk签名base64问题(#17)

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**仅需替换可执行文件**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

## 主要变化(2.1.1)

- 获取未读私信接口变化

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**仅需替换可执行文件**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

## 主要变化(2.1.0)

- 修复两处问题

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**仅需替换可执行文件**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

## 主要变化(2.0.9)

- 账号异常自动切换线路(#14)

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**仅需替换可执行文件**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

## 主要变化(2.0.8)

- 账号异常时未处理和发送通知

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**仅需替换可执行文件**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

## 主要变化(2.0.7)

- 修复一处问题
- 日志时间UTC+8(#13)

## 较上一版本变化

- `env.js`无
- `my_config.js`无

**仅需替换可执行文件**

_如果之前版本小于上一版本,请查看**历次更新**说明_
_[查看链接](https://github.com/shanmiteko/LotteryAutoScript/releases)_

## 主要变化

- 支持更新检查
- 增加设置`update_loop_wait`

## 较上一版本(v2.0.5)变化

- `env.js`无
- `my_config.js`增加设置`update_loop_wait`

**替换可执行文件和更新my_config.js**

_如果之前版本小于2.0.5,请查看历次更新说明_

## 主要变化

- 不参与主站黑名单用户抽奖
- my_config.js注释修改
- 可从环境变量中读取COOKIE
- 其他不影响功能的调整

## 较上一版本(v2.0.4)变化

- `env.js`无
- `my_config.js`无

**仅需替换可执行文件**

## 新特性

中奖通知设置可设黑名单

## 较上一版本(v2.0.3)变化

`env.js`无
`my_config.js`无
**仅需替换可执行文件**

## 问题修复

- 评论失败未退出
- 切割tag不精准

## 较上一版本(v2.0.2)变化

`env.js`无
`my_config.js`无
**仅需替换可执行文件**

edit: 替换release

## 问题修复

# 9

## 较上一版本(2.0.1)变化

`env.js`无
`my_config.js`无
**仅需替换可执行文件**

## 新增特性

增加两处自定义设置(`my_config.js`)

- `clear_quick_remove_attention`
- `notice_key_words`

## 问题修复

# 7

## 较上一版本(2.0.0)变化

`env.js`无
`my_config.js`需修改添加两处自定义设置
除了替换可执行文件，还要修改`my_config.js`文件

## 新增特性

打乱将转发的动态顺序，防止被人认出是抽奖号

## 问题修复

修复两处潜在bug

## 较上一版本(1.9.9)变化

`env.js`无
`my_config.js`无
只需替换可执行文件

## 优化体验

清理动态时日志更详细
以及其他细节处理

## 较上一版本(1.9.8)变化

`env.js`无
`my_config.js`无
只需替换可执行文件

edit: 1.9.9.1
edit: 1.9.9.2

## 修复Bug

两级解构时第一级为undefined(表现为异常退出)

## 较上一版本(1.9.7)变化

`env.js`更改注释内容
`my_config.js`无
只需替换可执行文件

## 修复Bug

转发专栏内的抽奖时无法获取关注

## 较上一版本(1.9.6)变化

`env.js`无
`my_config.js`无
只需替换可执行文件

## 主要变化(1.9.6)

去除对unzipper的依赖
专栏转发率达一半以上时跳过

## 较上一版本变更

`env.js`无
`my_config.js`无
只需替换可执行文件

## 主要新增功能(1.9.5)

可从专栏里获取抽奖动态

## 较上一版本变更

`env.js`无变化
`my_config.js`去掉部分设置，新增部分设置

## 1.9.0

修复Bug后的稳定版(大概

- 21/7/21 附加bat脚本增加对小白的友好性

## 1.8

fix: 开奖时间过滤失效

# 1.7

change 修复一处bug
change 重新上传zip
change 重新上传zip

## 1.6

perf:  重构代码

- 分离动态筛选部分的网络请求和数据处理
- 优化部分ifelse判断
feat:
- 新增NOT_GO_LOTTERY环境变量
- 边转边存dyid
- 滤除的dyid也进行存储
fix: 修复部分bug

## 1.5

feat: 日志相关

- 彩色输出
- 环境变量LOTTERY_LOG_LEVEL更改日志等级
feat: 设置相关
- lottery_loop_wait 抽奖循环
- check_loop_wait 检奖循环
- clear_loop_wait 清理循环

## 1.4

fix: 部分动态无法获取描述

## 1.3

feat: 新增loop_wait设置

可执行文件压缩包

# 命令行工具

可执行文件压缩包

可执行文件压缩包
