const setGlobalVar = require("./lib/setCookie");

const isUndefined = value => typeof value === 'undefined';

const {
    SCKEY,
    COOKIE,
    COOKIE_2,
    COOKIE_3,
    COOKIE_4,
    COOKIE_5,
} = process.env;

const COOKIE_ARR = [COOKIE, COOKIE_2, COOKIE_3, COOKIE_4, COOKIE_5];

COOKIE_ARR.forEach((cookie, num) => {
    if (isUndefined(cookie)) return;
    setGlobalVar(cookie, SCKEY).then(async () => {
        const { start, isMe, checkCookie } = require("./lib/lottery-in-nodejs");
        const isRight = await checkCookie(num + 1);
        if (!isRight) return;
        isMe();
        start();
    })
});
