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
const ServerChan = (text, desp) => {
    const { SCKEY } = GlobalVar;
    if (SCKEY === '') {
        console.log('未填写SCKEY')
        return;
    }
    Ajax.get({
        url: `https://sc.ftqq.com/${SCKEY}.send`,
        queryStringsObj: {
            text,
            desp
        },
        success: responseText => {
            console.log(responseText);
            if (JSON.parse(responseText).errno !== 0) throw new Error("ServerChan通知失败")
        }
    })
}

/**
 * pushplus通知
 * @param {string} text
 * @param {string} desp
 */
const pushplus = (text, desp) => {
    const { PUSH_PLUS_TOKEN } = GlobalVar;
    if (PUSH_PLUS_TOKEN === '') {
        console.log('未填写PUSH_PLUS_TOKEN')
        return;
    }
    Ajax.get({
        url: `http://pushplus.hxtrip.com/send`,
        queryStringsObj: {
            token: PUSH_PLUS_TOKEN,
            title: text,
            content: desp
        },
        success: responseText => {
            console.log(responseText);
            if (JSON.parse(responseText).code !== 200) throw new Error("pushplus通知失败")
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
            const { at_time, up_uname, business, source_content, url } = e
            if ((Date.now() / 1000 - at_time) / 3600 >= 2) {
                return;
            }
            desp += `发生时间: ${transformTimeZone(at_time * 1000, 8)}  \n\n`
            desp += `用户: ${up_uname}  \n\n`
            desp += `在${business}中@了你(${GlobalVar.myUID})  \n\n`
            desp += `原内容为: ${source_content}  \n\n`
            desp += `[直达链接](${url})  \n\n`
            desp += `---\n\n`
        });
    }
    if (desp !== '') {
        console.log(desp);
        ServerChan('可能中奖了!', desp);
        pushplus('可能中奖了!', desp);
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
        console.log('登录失败');
        ServerChan('动态抽奖出错', `COOKIE${num} 已失效 UID:${GlobalVar.myUID}`);
        pushplus('动态抽奖出错', `COOKIE${num} 已失效 UID:${GlobalVar.myUID}`);
        return false;
    }
}

module.exports = {
    start,
    isMe,
    checkCookie
}