const setGlobalVar = require("./lib/setCookie");

const { SCKEY } = process.env;

const COOKIE_ARR = (function () {
    let ret = []
    for (let i = 1; i < 10000; i++) {
        const cookie = process.env['COOKIE_' + i];
        if (typeof cookie === 'undefined') break;
        ret.push(cookie);
    }
    return ret;
})()

COOKIE_ARR.forEach(async (cookie, num) => {
    if (typeof cookie === 'string' && cookie.length > 10) {
        await setGlobalVar(cookie, SCKEY);
        const { start, isMe, checkCookie } = require("./lib/lottery-in-nodejs");
        const { clear } = require("./lib/clear");
        const isRight = await checkCookie(num + 1);
        if (!isRight) return;
        await isMe();
        if (process.argv.slice(2)[0] === 'clear') {
            console.log('开始清理动态');
            await clear();
            console.log('清理动态完毕');
        } else {
            console.log('开始参与抽奖');
            await start();
            console.log('参与抽奖结束');
        }
    }
});
