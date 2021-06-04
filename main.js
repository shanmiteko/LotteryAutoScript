const { tooltip, delay } = require("./lib/Base");

let multiple_account = [];

if (!process.env.CI) {
    const { initEnv, multiple_account_parm } = require("./env");
    multiple_account = multiple_account_parm;
    initEnv()
}

async function main() {
    const { COOKIE, NUMBER, CLEAR, PAT, LOCALLAUNCH, ENABLE_MULTIPLE_ACCOUNT, MULTIPLE_ACCOUNT } = process.env;
    if (LOCALLAUNCH || PAT) {
        if (ENABLE_MULTIPLE_ACCOUNT) {
            let muti_acco = multiple_account && multiple_account.length
                ? multiple_account
                : JSON.parse(MULTIPLE_ACCOUNT);

            process.env.ENABLE_MULTIPLE_ACCOUNT = '';

            for (const acco of muti_acco) {
                process.env.COOKIE = acco.COOKIE;
                process.env.NUMBER = acco.NUMBER;
                process.env.CLEAR = acco.CLEAR;
                await main();
                await delay(acco.WAIT);
            }
        } else {
            if (COOKIE) {
                const { setVariable } = require("./lib/setVariable");
                await setVariable(COOKIE, Number(NUMBER));

                const { start, isMe, checkCookie } = require("./lib/lottery-in-nodejs");
                const { clear } = require("./lib/clear");

                tooltip.log('[LotteryAutoScript] 账号' + NUMBER);

                if (await checkCookie(NUMBER)) {
                    switch (process.argv.slice(2)[0]) {
                        case 'start':
                            tooltip.log('开始参与抽奖');
                            await start();
                            break;
                        case 'check':
                            tooltip.log('检查是否中奖');
                            await isMe();
                            break;
                        case 'clear':
                            if (CLEAR) {
                                tooltip.log('开始清理动态');
                                await clear();
                                tooltip.log('清理动态完毕');
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    } else {
        tooltip.log('请查看README文件, 填入相应的PAT, 若是本地运行则设LOCALLAUNCH为true');
    }
}

(async function () {
    await main();
    process.exit(0)
})()