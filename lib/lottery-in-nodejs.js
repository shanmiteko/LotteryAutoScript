const Base = require('./Base');
const BiliAPI = require('./BiliAPI');
const GihubAPI = require("./GithubAPI");
const eventBus = require('./eventBus');
const GlobalVar = require('./GlobalVar');
const Public = require('./Public');
const Monitor = require('./Monitor');
const { sendNotify } = require('./sendNotify');
const config = require('./config');

/** Github运行限制时间*/
const MAX_TIME = 6 * 60 * 60 * 1000 - 6 * 60 * 1000;

async function createRandomDynamic(num) {
    Base.tooltip.log(`准备创建${num}条随机动态`);
    if (config.create_dy === '1') {
        const Dynamic = await Public.prototype.checkAllDynamic(GlobalVar.get("myUID"), 1);
        if ((Dynamic.allModifyDynamicResArray[0] || { type: 1 }).type === 1) {
            for (let index = 0; index < num; index++) {
                await BiliAPI.createDynamic(Base.getRandomStr(config.dy_contents));
                await Base.delay(2000);
            }
        } else {
            Base.tooltip.log('已有非抽奖动态故无需创建');
        }
    }
}

/**
 * 主函数
 * @param {string} cookie
 * @returns {Promise<void>}
 */
function start() {
    return new Promise(resolve => {
        let times = Base.counter();
        /* 注册事件 */
        eventBus.on('Turn_on_the_Monitor', async () => {
            const lotterys = GlobalVar.get("Lottery");
            if (lotterys.length === 0) {
                Base.tooltip.log('抽奖信息为空');
                resolve();
                return;
            }
            if (times.value() === lotterys.length) {
                await createRandomDynamic(config.create_dy_num);
                Base.tooltip.log('所有动态转发完毕');
                times.clear();
                Base.tooltip.log('[运行结束]目前无抽奖信息,过一会儿再来看看吧');
                resolve();
                return;
            }
            const lottery = lotterys[times.next()];
            const nlottery = Number(lottery);
            await (new Monitor(isNaN(nlottery) ? lottery : nlottery)).init();
        });
        eventBus.on('Turn_off_the_Monitor', async () => {
            await createRandomDynamic(config.create_dy_num);
            Base.tooltip.log('[运行结束]程序自动关闭');
            eventBus.flush();
            resolve();
        })
        if (process.env.LOCALLAUNCH) {
            eventBus.emit('Turn_on_the_Monitor');
        } else {
            setTimeout(() => {
                Base.tooltip.log('运行时间超过Actions上限 - 6小时');
                eventBus.emit('Turn_off_the_Monitor')
            }, MAX_TIME);
            GihubAPI.hasLotteryRun().then(s => {
                if (s) {
                    Base.tooltip.log("有冲突的工作流故终止此任务");
                    resolve()
                } else {
                    eventBus.emit('Turn_on_the_Monitor');
                }
            })
        }
    });
}

/**
 * 是否中奖
 */
async function isMe() {
    let desp = '';
    const UnreadAtNum = await BiliAPI.getUnreadAtNum();
    const UnreadSessionNum = await BiliAPI.getUnreadSessionNum();
    const { follow_unread, unfollow_unread } = UnreadSessionNum || { unfollow_unread: 0, follow_unread: 0 };
    if (UnreadAtNum > 0) {
        Base.tooltip.log('<-- 正在检查at');
        const MyAtInfo = await BiliAPI.getMyAtInfo();
        MyAtInfo.forEach(async AtInfo => {
            const { at_time, up_uname, business, source_content, url } = AtInfo
            desp += `发生时间: ${Base.transformTimeZone(at_time * 1000, 8)}  \n\n`
            desp += `用户: ${up_uname}  \n\n`
            desp += `在${business}中@了你(${GlobalVar.get("myUID")})  \n\n`
            desp += `原内容为: ${source_content}  \n\n`
            desp += `[直达链接](${url})  \n\n`
            desp += `\n\n\n\n`
        });
        Base.tooltip.log('--> OK');
    }
    if (follow_unread + unfollow_unread > 0) {
        const check = async (type) => {
            let session_t = '';
            let max = 0;
            let MySession = await BiliAPI.getSessionInfo(type)
            do {
                for (const Session of MySession.data) {
                    const { content, sender_uid, session_ts, timestamp, talker_id } = Session;
                    session_t = session_ts;
                    if (talker_id) {
                        BiliAPI.updateSessionStatus(talker_id);
                        await Base.delay(1000);
                        if (/中奖|获得|填写|写上|提供|地址|支付宝账号|码|大会员/.test(content)) {
                            desp += `发生时间: ${Base.transformTimeZone(timestamp * 1000, 8)}  \n\n`
                            desp += `用户: ${sender_uid}  \n\n`
                            desp += `私信你(${GlobalVar.get("myUID")})说: ${content}  \n\n`
                            desp += `[直达链接](https://message.bilibili.com/#/whisper/mid${sender_uid})  \n\n`
                            desp += `\n\n\n\n`
                        }
                    }
                }
                if (MySession.has_more) {
                    await Base.delay(3e3);
                    MySession = await BiliAPI.getSessionInfo(type, session_t)
                }
                max++
            } while (MySession.has_more && max < 10);
        }
        if (follow_unread) {
            Base.tooltip.log('<-- 正在检查已关注者的私信')
            await check(1)
        }
        if (unfollow_unread) {
            Base.tooltip.log('<-- 正在检查未关注者的私信')
            await check(2)
        }
        Base.tooltip.log('--> OK');
    }
    if (desp) {
        Base.tooltip.log(desp);
        await sendNotify('可能中奖了', desp);
    } else {
        Base.tooltip.log("未中奖");
    }
    return;
}

/**
 * 检查cookie是否有效
 * @param {string} num
 */
async function checkCookie(num) {
    if (await BiliAPI.getMyinfo()) {
        Base.tooltip.log('成功登录');
        return true;
    } else {
        Base.tooltip.log(`登录失败 COOKIE${num} 已失效 UID:${GlobalVar.get("myUID")}`);
        await sendNotify('动态抽奖出错-登录失败', `COOKIE${num} 已失效 UID:${GlobalVar.get("myUID")}`)
        return false;
    }
}


module.exports = {
    start,
    isMe,
    checkCookie
}