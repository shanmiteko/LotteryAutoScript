const { isMe } = require('./check');
const { clear } = require('./clear');
const { start } = require('./lottery');
const global_var = require('./data/global_var')
const bili = require('./net/bili')
const { log } = require('./utils')
const { sendNotify } = require('./helper/notify');

/**
 * 检查cookie是否有效
 * @param {string} num
 */
async function checkCookie(num) {
    const My_UID = global_var.get("myUID");
    if (await bili.getMyinfo()) {
        log.info('Cookie有效性检测', `成功登录 UID:${My_UID}`);
        return true;
    } else {
        log.error('Cookie有效性检测', `登录失败 COOKIE${num} 已失效 UID:${My_UID}`);
        await sendNotify('动态抽奖出错-登录失败', `COOKIE${num} 已失效 UID:${My_UID}`)
        return false;
    }
}


module.exports = { start, isMe, clear, checkCookie }