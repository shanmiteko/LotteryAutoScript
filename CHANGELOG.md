<!-- markdownlint-disable MD036 MD024-->
# CHANGELOG
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
