const Base = require('./Base');
const { transformTimeZone } = require('./Base');
const BiliAPI = require('./BiliAPI');
const GihubAPI = require("./GithubAPI");
const eventBus = require('./eventBus');
const GlobalVar = require('./GlobalVar.json');
const Public = require('./Public');
const Monitor = require('./Monitor');
const { sendNotify } = require('./sendNotify');
const MAX_TIME = 6 * 60 * 60 * 1000 - 6 * 60 * 1000;
/**
 * 主函数
 * @param {string} cookie
 * @returns {Promise<void>}
 */
function start() {
    return new Promise(resolve => {
        function createRandomDynamic() {
            if (GlobalVar.create_dy === '1') {
                Public.prototype.checkAllDynamic(GlobalVar.myUID, 1).then(Dynamic => {
                    if (Dynamic.allModifyDynamicResArray[0].type === 1) {
                        Base.getPictures().then(
                            (pic) => {
                                BiliAPI.createDynamic('', pic);
                            },
                            (con) => {
                                BiliAPI.createDynamic(con);
                            }
                        )
                    }
                })
            }
        }
        let times = Base.counter();
        /* 注册事件 */
        eventBus.on('Turn_on_the_Monitor', () => {
            if (times.value() === GlobalVar.Lottery.length) {
                console.log('所有动态转发完毕');
                console.log('[运行结束]目前无抽奖信息,过一会儿再来看看吧');
                times.clear();
                createRandomDynamic()
                resolve()
                return
            }
            const lottery = GlobalVar.Lottery[times.next()];
            const nlottery = Number(lottery);
            (new Monitor(isNaN(nlottery) ? lottery : nlottery)).init();
        });
        eventBus.on('Turn_off_the_Monitor', () => {
            console.log('[运行结束]出现异常程序自动关闭');
            createRandomDynamic()
            resolve()
        })
        if (process.env.LOCALLAUNCH) {
            eventBus.emit('Turn_on_the_Monitor');
        } else {
            setTimeout(() => {
                console.log('运行时间超过Actions上限 - 6小时');
                eventBus.emit('Turn_off_the_Monitor')
            }, MAX_TIME);
            GihubAPI.hasLotteryRun().then(s => {
                if (s) {
                    console.log("有冲突的工作流故终止此任务");
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
    const MyAtInfo = await BiliAPI.getMyAtInfo();
    let MySession = await BiliAPI.getSessionInfo();
    let desp = '';
    if (MyAtInfo.length) {
        console.log('<-- 正在检查at');
        MyAtInfo.forEach(async AtInfo => {
            const { at_time, up_uname, business, source_content, url } = AtInfo
            if ((Date.now() / 1000 - at_time) / 3600 >= 2) {
                return;
            }
            desp += `发生时间: ${transformTimeZone(at_time * 1000, 8)}  \n\n`
            desp += `用户: ${up_uname}  \n\n`
            desp += `在${business}中@了你(${GlobalVar.myUID})  \n\n`
            desp += `原内容为: ${source_content}  \n\n`
            desp += `[直达链接](${url})  \n\n`
            desp += `---------------------  \n\n`
        });
        console.log('--> OK');
    }
    if (MySession.data.length) {
        console.log('<-- 正在检查私信')
        let session_t = '';
        let max = 0;
        do {
            for (const Session of MySession.data) {
                const { content, sender_uid, session_ts, timestamp, talker_id } = Session;
                session_t = session_ts;
                if (talker_id) {
                    BiliAPI.updateSessionStatus(talker_id);
                    await Base.delay(1000);
                }
                /**两小时内 */
                if ((Date.now() / 1000 - timestamp) / 3600 < 2) {
                    if (/中奖|填写|写上|提供|收货地址|支付宝账号|收款码|激活码/.test(content)) {
                        desp += `发生时间: ${transformTimeZone(timestamp * 1000, 8)}  \n\n`
                        desp += `用户: ${sender_uid}  \n\n`
                        desp += `私信你(${GlobalVar.myUID})说: ${content}  \n\n`
                        desp += `[直达链接](https://message.bilibili.com/#/whisper/mid${sender_uid}) \n\n`
                        desp += `---------------------  \n\n`
                    }
                }
            }
            if (MySession.has_more) {
                await Base.delay(3e3);
                MySession = await BiliAPI.getSessionInfo(session_t)
            }
            max++
        } while (MySession.has_more && max < 10);
        console.log('--> OK');
    }
    if (desp) {
        console.log(desp);
        sendNotify('可能中奖了!', desp);
    } else {
        console.log("未中奖");
    }
    return;
}

/**
 * 检查cookie是否有效
 * @param {string} num
 */
async function checkCookie(num) {
    if (await BiliAPI.getMyinfo()) {
        console.log('成功登录');
        return true;
    } else {
        console.log(`登录失败 COOKIE${num} 已失效 UID:${GlobalVar.myUID}`);
        sendNotify('动态抽奖出错-登录失败', `COOKIE${num} 已失效 UID:${GlobalVar.myUID}`)
        return false;
    }
}
module.exports = {
    start,
    isMe,
    checkCookie
}