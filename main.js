const setGlobalVar = require("./lib/setCookie");

const {
    SCKEY,
    COOKIE = 'DedeUserID=478207966; SESSDATA=15b4607a%2C1622340565%2C4eae0*c1; bili_jct=a8c20b10ba3cbe3ca535395d227545d5; ',
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
