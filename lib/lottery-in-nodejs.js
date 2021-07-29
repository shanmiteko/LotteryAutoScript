const Util = require('./Util');
const BiliAPI = require('./BiliAPI');
const eventBus = require('./eventBus');
const GlobalVar = require('./GlobalVar');
const Public = require('./Public');
const Monitor = require('./Monitor');
const { sendNotify } = require('./sendNotify');
const config = require('./config');
const { log } = Util;

async function createRandomDynamic(num) {
    if (config.create_dy) {
        log.info('随机动态', `准备创建${num}条随机动态`);
        const Dynamic = await Public.prototype.checkAllDynamic(GlobalVar.get("myUID"), 1);
        if ((Dynamic.allModifyDynamicResArray[0] || { type: 0 }).type === 1) {
            for (let index = 0; index < num; index++) {
                await BiliAPI.createDynamic(Util.getRandomOne(config.dy_contents));
                await Util.delay(2000);
            }
        } else {
            log.info('随机动态', '已有非抽奖动态故无需创建');
        }
    }
}

/**
 * 抽奖主函数
 * @param {string} cookie
 * @returns {Promise<void>}
 */
function start() {
    return new Promise(resolve => {
        let times = Util.counter();
        /* 注册事件 */
        eventBus.on('Turn_on_the_Monitor', async () => {
            const lotterys = GlobalVar.get("Lottery");
            if (lotterys.length === 0) {
                log.info('抽奖', '抽奖信息为空');
                resolve();
                return;
            }
            if (times.value() === lotterys.length) {
                await createRandomDynamic(config.create_dy_num);
                log.info('抽奖', '所有动态转发完毕');
                times.clear();
                eventBus.emit('Turn_off_the_Monitor', '目前无抽奖信息,过一会儿再来看看吧')
                return;
            }
            const lottery = lotterys[times.next()];

            await (new Monitor(lottery)).init();
        });
        eventBus.on('Turn_off_the_Monitor', async (msg) => {
            await createRandomDynamic(config.create_dy_num);
            log.info('结束抽奖', '原因: ' + msg);
            eventBus.flush();
            resolve();
        })
        eventBus.emit('Turn_on_the_Monitor');
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
        log.info('中奖检测', '<-- 正在检查at');
        const MyAtInfo = await BiliAPI.getMyAtInfo();
        MyAtInfo.forEach(async AtInfo => {
            const { at_time, up_uname, business, source_content, url } = AtInfo
            desp += `发生时间: ${new Date(at_time * 1000).toLocaleString()}  \n\n`
            desp += `用户: ${up_uname}  \n\n`
            desp += `在${business}中@了你(${GlobalVar.get("myUID")})  \n\n`
            desp += `原内容为: ${source_content}  \n\n`
            desp += `[直达链接](${url})  \n\n`
            desp += `\n\n\n\n`
        });
        log.info('中奖检测', '--> OK');
    }
    if (follow_unread + unfollow_unread > 0) {
        const check = async (type) => {
            let session_t = '';
            let MySession = await BiliAPI.getSessionInfo(type)
            for (const index of Util.infiniteNumber()) {
                for (const Session of MySession.data) {
                    const { content, sender_uid, session_ts, timestamp, talker_id } = Session;
                    session_t = session_ts;
                    if (talker_id) {
                        BiliAPI.updateSessionStatus(talker_id);
                        await Util.delay(1000);
                        if (/中奖|获得|填写|写上|提供|收货地址|支付宝账号|码|大会员/.test(content)) {
                            desp += `发生时间: ${new Date(timestamp * 1000).toLocaleString()}  \n\n`
                            desp += `用户: ${sender_uid}  \n\n`
                            desp += `私信你(${GlobalVar.get("myUID")})说: ${content}  \n\n`
                            desp += `[直达链接](https://message.bilibili.com/#/whisper/mid${sender_uid})  \n\n`
                            desp += `\n\n\n\n`
                        }
                    }
                }
                if (MySession.has_more && index < 16) {
                    await Util.delay(3e3);
                    MySession = await BiliAPI.getSessionInfo(type, session_t)
                } else {
                    break
                }
            }
        }
        if (follow_unread) {
            log.info('中奖检测', '<-- 正在检查已关注者的私信')
            await check(1)
        }
        if (unfollow_unread) {
            log.info('中奖检测', '<-- 正在检查未关注者的私信')
            await check(2)
        }
        log.info('中奖检测', '--> OK');
    }
    if (desp) {
        desp += '中奖了别忘给脚本(https://github.com/shanmiteko/LotteryAutoScript)点一个Star哦, 赞助一两块也不是不可以‍‍‍_(:з」∠)_\n\n'
        log.info(desp);
        await sendNotify('可能中奖了', desp);
    } else {
        log.info('中奖检测', "未中奖");
    }
    return;
}

/**
 * 检查cookie是否有效
 * @param {string} num
 */
async function checkCookie(num) {
    const My_UID = GlobalVar.get("myUID");
    if (await BiliAPI.getMyinfo()) {
        log.info('Cookie有效性检测', `成功登录 UID:${My_UID}`);
        return true;
    } else {
        log.error('Cookie有效性检测', `登录失败 COOKIE${num} 已失效 UID:${My_UID}`);
        await sendNotify('动态抽奖出错-登录失败', `COOKIE${num} 已失效 UID:${My_UID}`)
        return false;
    }
}


module.exports = {
    start,
    isMe,
    checkCookie
}