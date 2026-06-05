const util = require('./util');
const utils = require('../lib/utils.js');
const config = require('../lib/data/config');

(async () => {
    await util.par_run([], [
        // 0
        async () => {
            let msg = await utils.getAiContent(
                config.ai_judge_parm.url,
                config.ai_judge_parm.body,
                config.ai_judge_parm.prompt,
                '#胜利女神新的希望# #nikke# \n【一周年评论盖楼挑战③】拿来吧妮……的表情包！\n\n指挥官的手机里，\n一定存着几张出场率超高的妮姬表情包吧？\n和妮姬们相遇的一周年已至，这些也成了旅途中的一段快乐印记~是时候公开自己的库存了yo！\n\n无论是新收新做的趣味表情，还是珍藏一年的经典老图——\n现在，让它们登场吧！\n\n评论区交出您的表情包库存，看看这一年谁的“收藏”最cool！！\n🎁我们将在6月9日于本条评论区随机抽选：\n▶1位指挥官赠送【周边大礼盒】× 1\n▶10位指挥官赠送【Q版印章小立牌】× 1\n\n💝盖楼目标达成奖励：\n5月20日~22日期间，参与【一周年评论盖楼挑战】系列话题活动！ 当全平台评论数累计达成 【2026】 楼时，我们将从本平台参与系列话题活动的用户中额外抽取2位幸运指挥官，每人送出【哈曼卡顿音响】× 1！\n\n————————————\n✦《胜利女神：新的希望》一周年庆典版本「OLD TALES 尘封童话」现已上线！游戏多端互通，前往Bilibili游戏中心搜索《胜利女神：新的希望》即可下载。'
            );
            console.log(JSON.parse(msg));
            msg = await utils.getAiContent(
                config.ai_comments_parm.url,
                config.ai_comments_parm.body,
                config.ai_comments_parm.prompt,
                '#胜利女神新的希望# #nikke# \n【一周年评论盖楼挑战③】拿来吧妮……的表情包！\n\n指挥官的手机里，\n一定存着几张出场率超高的妮姬表情包吧？\n和妮姬们相遇的一周年已至，这些也成了旅途中的一段快乐印记~是时候公开自己的库存了yo！\n\n无论是新收新做的趣味表情，还是珍藏一年的经典老图——\n现在，让它们登场吧！\n\n评论区交出您的表情包库存，看看这一年谁的“收藏”最cool！！\n🎁我们将在6月9日于本条评论区随机抽选：\n▶1位指挥官赠送【周边大礼盒】× 1\n▶10位指挥官赠送【Q版印章小立牌】× 1\n\n💝盖楼目标达成奖励：\n5月20日~22日期间，参与【一周年评论盖楼挑战】系列话题活动！ 当全平台评论数累计达成 【2026】 楼时，我们将从本平台参与系列话题活动的用户中额外抽取2位幸运指挥官，每人送出【哈曼卡顿音响】× 1！\n\n————————————\n✦《胜利女神：新的希望》一周年庆典版本「OLD TALES 尘封童话」现已上线！游戏多端互通，前往Bilibili游戏中心搜索《胜利女神：新的希望》即可下载。'
            );
            console.log(msg);
            msg = await utils.getAiContent(
                config.ai_judge_parm.url,
                config.ai_judge_parm.body,
                config.ai_judge_parm.prompt,
                '#全民掉线行动#今日启动！参与活动，领GT7、X1心动优惠 2022年助你去线去烦恼，乐享焕新声活！活动规则见下图。 #供电局福利社# #互动抽奖##抽奖# 【关注】@Haylou嘿喽 ，带话题#全民掉线行动#，【转发+评论+赞】本动态，小嘿将随机抽4个欧皇送出以下福利： 一等奖：Haylou X1 双降噪蓝牙耳机 1台 二等奖：Haylou GT7 真无线蓝牙耳机1台 三等奖：50元京东卡*2 并且小嘿特意又申请了意外惊喜，加码福利送上，大家冲鸭： 截至抽奖结束： 【转发超1w】，再抽一位小可爱送50元京东卡*1 【粉丝超1.5w】，再抽一位小可爱送Haylou T17运动蓝牙耳机*1台 开奖时间1月27日，中奖名单将通过第三方抽奖工具选出。冲冲冲！ *一定要时刻关注@Haylou嘿喽 哦！开奖后的3天内，未回复小嘿私信领奖的粉丝按照自动弃奖处理哦！ '
            );
            console.log(JSON.parse(msg));
            msg = await utils.getAiContent(
                config.ai_comments_parm.url,
                config.ai_comments_parm.body,
                config.ai_comments_parm.prompt,
                '#全民掉线行动#今日启动！参与活动，领GT7、X1心动优惠 2022年助你去线去烦恼，乐享焕新声活！活动规则见下图。 #供电局福利社# #互动抽奖##抽奖# 【关注】@Haylou嘿喽 ，带话题#全民掉线行动#，【转发+评论+赞】本动态，小嘿将随机抽4个欧皇送出以下福利： 一等奖：Haylou X1 双降噪蓝牙耳机 1台 二等奖：Haylou GT7 真无线蓝牙耳机1台 三等奖：50元京东卡*2 并且小嘿特意又申请了意外惊喜，加码福利送上，大家冲鸭： 截至抽奖结束： 【转发超1w】，再抽一位小可爱送50元京东卡*1 【粉丝超1.5w】，再抽一位小可爱送Haylou T17运动蓝牙耳机*1台 开奖时间1月27日，中奖名单将通过第三方抽奖工具选出。冲冲冲！ *一定要时刻关注@Haylou嘿喽 哦！开奖后的3天内，未回复小嘿私信领奖的粉丝按照自动弃奖处理哦！ '
            );
            console.log(msg);
            msg = await utils.getAiContent(
                config.ai_judge_parm.url,
                config.ai_judge_parm.body,
                config.ai_judge_parm.prompt,
                '#全民掉线行动#今日启动！参与活动，领GT7、X1心动优惠 2022年助你去线去烦恼，乐享焕新声活！活动规则见下图。 #供电局福利社# #互动抽奖##抽奖# 【关注】@Haylou嘿喽 ，带话题#全民掉线行动#，【转发+评论+赞】本动态，小嘿将随机抽4个欧皇送出以下福利： 一等奖：Haylou X1 双降噪蓝牙耳机 1台 二等奖：Haylou GT7 真无线蓝牙耳机1台 三等奖：50元京东卡*2 并且小嘿特意又申请了意外惊喜，加码福利送上，大家冲鸭： 截至抽奖结束： 【转发超1w】，再抽一位小可爱送50元京东卡*1 【粉丝超1.5w】，再抽一位小可爱送Haylou T17运动蓝牙耳机*1台，中奖名单将通过第三方抽奖工具选出。冲冲冲！ *一定要时刻关注@Haylou嘿喽 哦！开奖后的3天内，未回复小嘿私信领奖的粉丝按照自动弃奖处理哦！ '
            );
            console.log(JSON.parse(msg));
            msg = await utils.getAiContent(
                config.ai_comments_parm.url,
                config.ai_comments_parm.body,
                config.ai_comments_parm.prompt,
                '#全民掉线行动#今日启动！参与活动，领GT7、X1心动优惠 2022年助你去线去烦恼，乐享焕新声活！活动规则见下图。 #供电局福利社# #互动抽奖##抽奖# 【关注】@Haylou嘿喽 ，带话题#全民掉线行动#，【转发+评论+赞】本动态，小嘿将随机抽4个欧皇送出以下福利： 一等奖：Haylou X1 双降噪蓝牙耳机 1台 二等奖：Haylou GT7 真无线蓝牙耳机1台 三等奖：50元京东卡*2 并且小嘿特意又申请了意外惊喜，加码福利送上，大家冲鸭： 截至抽奖结束： 【转发超1w】，再抽一位小可爱送50元京东卡*1 【粉丝超1.5w】，再抽一位小可爱送Haylou T17运动蓝牙耳机*1台 开奖时间1月27日，中奖名单将通过第三方抽奖工具选出。冲冲冲！ *一定要时刻关注@Haylou嘿喽 哦！开奖后的3天内，未回复小嘿私信领奖的粉丝按照自动弃奖处理哦！ '
            );
            console.log(msg);
        },
    ]);
    console.log('ai.test ... ok!');
})();
