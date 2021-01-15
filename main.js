const setGlobalVar = require("./lib/setCookie");

const { NUMBER, COOKIE, SCKEY } = process.env;

((async () => {
    if (typeof COOKIE === 'string' && COOKIE.length > 10) {
        await setGlobalVar(COOKIE, SCKEY);
        const { start, isMe, checkCookie } = require("./lib/lottery-in-nodejs");
        const { clear } = require("./lib/clear");
        const isRight = await checkCookie(NUMBER);
        if (!isRight) return;
        await isMe();
        if (process.argv.slice(2)[0] === 'clear') {
            console.log('开始清理动态');
            await clear();
            console.log('清理动态完毕');
        } else {
            console.log('开始参与抽奖');
            await start();
        }
    }
}))();
