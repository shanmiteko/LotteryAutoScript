const Ajax = require('./Ajax');
const BiliAPI = require('./BiliAPI');
const eventBus = require('./eventBus');
const GlobalVar = require('./GlobalVar.json');
const Monitor = require('./Monitor');
const Script = require('./Script');

/**
 * 主函数
 * @param {string} cookie
 */
function start() {
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
    BiliAPI.sendChat('456295362727813281', (new Date(Date.now())).toLocaleString() + Script.version, 17, false);
}

/**
 * 是否中奖
 */
async function isMe() {
    if (GlobalVar.SCKEY === '') return;
    const arr = await BiliAPI.getMyAtInfo();
    const text = '可能中奖了!';
    let desp = '';
    if (arr.length !== 0) {
        arr.forEach(e => {
            desp += `发生时间: ${e.time}  \n\n`
            desp += `用户: ${e.nickname}  \n\n`
            desp += `在${e.business}中@了你  \n\n`
            desp += `原内容为: ${e.source_content}  \n\n`
            desp += `[直达链接](${e.url})  \n\n`
            desp += `---\n\n`
        });
    }
    if (desp !== '') {
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
    return;
}

/**
 * 检查cookie是否有效
 * @param {number} num
 */
async function checkCookie(num) {
    if (await BiliAPI.getMyinfo()) {
        console.log('成功登录');
        return true;
    } else {
        console.log('登录失败');
        console.log(num);
        if (GlobalVar.SCKEY === '') return false;
        Ajax.get({
            url: `https://sc.ftqq.com/${SCKEY}.send`,
            queryStringsObj: {
                text: '动态抽奖出错',
                desp: `COOKIE${num} 已失效`
            },
            success: responseText => {
                console.log(responseText);
            }
        })
        return false;
    }
}

module.exports = {
    start,
    isMe,
    checkCookie
}