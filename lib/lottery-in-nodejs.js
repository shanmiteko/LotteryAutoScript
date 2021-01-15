const Ajax = require('./Ajax');
const { transformTimeZone } = require('./Base');
const BiliAPI = require('./BiliAPI');
const eventBus = require('./eventBus');
const GlobalVar = require('./GlobalVar.json');
const Monitor = require('./Monitor');
const Script = require('./Script');

/**
 * server酱通知
 * @param {string} text
 * @param {string} desp
 */
const ServerChan = (text,desp) => {
    const { SCKEY } = GlobalVar;
    if (SCKEY === '') return;
    Ajax.get({
        url: `https://sc.ftqq.com/${SCKEY}.send`,
        queryStringsObj: {
            text,
            desp
        },
        success: responseText => {
            console.log(responseText);
        }
    })
}

/**
 * 主函数
 * @param {string} cookie
 */
function start() {
    const { version } = Script;
    /* 注册事件 */
    {
        let i = 0;
        eventBus.on('Turn_on_the_Monitor', () => {
            if (i === GlobalVar.Lottery.length) {
                console.log('所有动态转发完毕');
                console.log('[运行结束]目前无抽奖信息,过一会儿再来看看吧');
                i = 0;
                return;
            }
            (new Monitor(GlobalVar.Lottery[i++])).init();
        });
    }
    eventBus.emit('Turn_on_the_Monitor');
    BiliAPI.sendChat('456295362727813281', (new Date(Date.now())).toLocaleString() + version, 17, false);
}

/**
 * 是否中奖
 */
async function isMe() {
    const arr = await BiliAPI.getMyAtInfo();
    let desp = '';
    if (arr.length !== 0) {
        arr.forEach(async e => {
            const { at_time, id, nickname, business, source_content, url } = e
            if ((Date.now() / 1000 - at_time) / 3600 >= 2) {
                await BiliAPI.delAtinfo(id);
                return;
            }
            desp += `发生时间: ${transformTimeZone(at_time * 1000, 8)}  \n\n`
            desp += `用户: ${nickname}  \n\n`
            desp += `在${business}中@了你  \n\n`
            desp += `原内容为: ${source_content}  \n\n`
            desp += `[直达链接](${url})  \n\n`
            desp += `---\n\n`
        });
    }
    if (desp !== '') ServerChan('可能中奖了!', desp);
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
        console.log('登录失败');
        ServerChan('动态抽奖出错',`COOKIE${num} 已失效`);
        return false;
    }
}

module.exports = {
    start,
    isMe,
    checkCookie
}