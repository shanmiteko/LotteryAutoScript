const { log, delay, infiniteNumber, judge } = require('./utils')
const { sendNotify } = require('./helper/notify')
const config = require('./data/config')
const global_var = require('./data/global_var')
const bili = require('./net/bili')

/**
 * 是否中奖
 */
async function isMe() {
    let desp = '';
    const UnreadAtNum = await bili.getUnreadAtNum();
    const UnreadSessionNum = await bili.getUnreadSessionNum();
    const { follow_unread, unfollow_unread } = UnreadSessionNum || { unfollow_unread: 0, follow_unread: 0 };
    if (UnreadAtNum > 0) {
        log.info('中奖检测', '<-- 正在检查at');
        const MyAtInfo = await bili.getMyAtInfo();
        MyAtInfo.forEach(async AtInfo => {
            const { at_time, up_uname, business, source_content, url } = AtInfo
            desp += `发生时间: ${new Date(at_time * 1000).toLocaleString()}  \n\n`
            desp += `用户: ${up_uname}  \n\n`
            desp += `在${business}中@了你(${global_var.get("myUID")})  \n\n`
            desp += `原内容为: ${source_content}  \n\n`
            desp += `[直达链接](${url})  \n\n`
            desp += `\n\n`
        });
        log.info('中奖检测', '--> OK');
    }
    if (follow_unread + unfollow_unread > 0) {
        const check = async (type) => {
            let session_t = '';
            let MySession = await bili.getSessionInfo(type)
            for (const index of infiniteNumber()) {
                for (const Session of MySession.data) {
                    const { content, sender_uid, session_ts, timestamp, unread_count, talker_id, msg_seqno } = Session;
                    session_t = session_ts;
                    if (unread_count) {
                        bili.updateSessionStatus(talker_id, type, msg_seqno);
                        await delay(1000);
                        if (judge(content, config.notice_key_words)) {
                            desp += `发生时间: ${new Date(timestamp * 1000).toLocaleString()}  \n\n`
                            desp += `用户: ${sender_uid}  \n\n`
                            desp += `私信你(${global_var.get("myUID")})说: ${content}  \n\n`
                            desp += `[直达链接](https://message.bilibili.com/#/whisper/mid${sender_uid})  \n\n`
                            desp += `\n\n`
                        }
                    }
                }
                if (MySession.has_more && index < 16) {
                    await delay(3e3);
                    MySession = await bili.getSessionInfo(type, session_t)
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
        log.info('可能中奖了', desp);
        await sendNotify('可能中奖了', desp);
    } else {
        log.info('中奖检测', "暂未中奖");
    }
    return;
}


module.exports = { isMe };