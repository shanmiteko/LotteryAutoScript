const { log, delay, infiniteNumber, judge } = require('./utils');
const { sendNotify } = require('./helper/notify');
const config = require('./data/config');
const global_var = require('./data/global_var');
const bili = require('./net/bili');

/**
 * 是否中奖
 * @param {number} num
 */
async function isMe(num) {
    let desp = '';
    const
        { notice_key_words, update_session_wait, get_session_wait, check_session_pages } = config,
        { at: unread_at_num, reply: unread_reply_num } = await bili.getUnreadNum(),
        unread_session_num = await bili.getUnreadSessionNum(),
        { follow_unread, unfollow_unread } = unread_session_num || { unfollow_unread: 0, follow_unread: 0 };
    if (unread_at_num) {
        log.info('中奖检测', '<-- 正在检查at');
        const MyAtInfo = await bili.getMyAtInfo();
        MyAtInfo
            .slice(0, unread_at_num)
            .forEach(({ at_time, up_uname, business, source_content, url }) => {
                desp += '## [at]检测结果\n\n';
                desp += '- - - -\n\n';
                desp += `发生时间: ${new Date(at_time * 1000).toLocaleString()}\n\n`;
                desp += `用户: ${up_uname}\n\n`;
                desp += `在${business}中@了[你](https://space.bilibili.com/${global_var.get('myUID')})\n\n`;
                desp += `原内容为: ${source_content}\n\n`;
                desp += `[直达链接](${url})\n\n`;
                desp += '- - - -\n\n';
            });
        log.info('中奖检测', '--> OK');
    }
    if (unread_reply_num) {
        log.info('中奖检测', '<-- 正在检查回复');
        const replys = await bili.getReplyMsg();
        replys
            .slice(0, unread_reply_num)
            .forEach(({ nickname, uri, source, timestamp }) => {
                if (judge(source, notice_key_words)) {
                    desp += '## 回复检测结果\n\n';
                    desp += '- - - -\n\n';
                    desp += `发生时间: ${new Date(timestamp * 1000).toLocaleString()}\n\n`;
                    desp += `用户: ${nickname}\n\n`;
                    desp += `回复[你](https://space.bilibili.com/${global_var.get('myUID')})说:\n${source}\n\n`;
                    desp += `[直达链接](${uri})\n\n`;
                    desp += '- - - -\n\n';
                }
            });
        log.info('中奖检测', '--> OK');
    }
    if (follow_unread + unfollow_unread > 0) {
        const check = async (type) => {
            let session_t = '';
            let MySession = await bili.getSessionInfo(type);
            log.info('准备检查私信', check_session_pages + '页');
            for (const index of infiniteNumber()) {
                for (const Session of MySession.data) {
                    const { sender_uid, session_ts, timestamp, unread_count, talker_id, msg_seqno } = Session;
                    session_t = session_ts;
                    if (unread_count) {
                        const content = await bili.fetch_session_msgs(talker_id, unread_count);
                        if (judge(content, notice_key_words)) {
                            desp += '## 私信检测结果\n\n';
                            desp += '- - - -\n\n';
                            desp += `发生时间: ${new Date(timestamp * 1000).toLocaleString()}\n\n`;
                            desp += `用户: ${sender_uid}\n\n`;
                            desp += `私信[你](https://space.bilibili.com/${global_var.get('myUID')})说:\n${content}\n\n`;
                            desp += `[直达链接](https://message.bilibili.com/#/whisper/mid${sender_uid})\n\n`;
                            desp += '- - - -\n\n';
                        }
                        await bili.updateSessionStatus(talker_id, type, msg_seqno);
                        await delay(update_session_wait);
                    }
                }
                if (MySession.has_more && index < check_session_pages) {
                    await delay(get_session_wait);
                    MySession = await bili.getSessionInfo(type, session_t);
                } else {
                    break;
                }
            }
        };
        if (follow_unread) {
            log.info('中奖检测', '<-- 正在检查已关注者的私信');
        }
        if (unfollow_unread) {
            log.info('中奖检测', '<-- 正在检查未关注者的私信');
        }
        await check('1');
        log.info('中奖检测', '--> OK');
    }
    if (desp) {
        log.notice('可能中奖了', desp);
        await sendNotify(`帐号${num}可能中奖了`, desp);
    } else {
        log.notice('中奖检测', '暂未中奖');
    }
    return;
}


module.exports = { isMe };