const setGlobalVar = require("./lib/setCookie");

const {
    SCKEY,
    COOKIE,
    COOKIE_2,
    COOKIE_3,
    COOKIE_4,
    COOKIE_5,
} = process.env;

const COOKIE_ARR = [COOKIE, COOKIE_2, COOKIE_3, COOKIE_4, COOKIE_5];

COOKIE_ARR.forEach(async (cookie, num) => {
    if (typeof cookie === 'string' && cookie.length > 10) {
        await setGlobalVar(cookie, SCKEY);
        const { start, isMe, checkCookie } = require("./lib/lottery-in-nodejs");
        const isRight = await checkCookie(num + 1);
        if (!isRight) return;
        await isMe();
        await start();
    }
});
