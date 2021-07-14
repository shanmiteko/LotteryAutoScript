const { env_file, tooltip, delay } = require("./lib/Base");

let multiple_account = [];

if (!process.env.CI) {
    const { initEnv, multiple_account_parm } = require(env_file);
    if (multiple_account_parm) {
        multiple_account = multiple_account_parm;
    }
    initEnv()
}

async function main() {
    const { COOKIE, NUMBER, CLEAR, PAT, LOCALLAUNCH, ENABLE_MULTIPLE_ACCOUNT, MULTIPLE_ACCOUNT } = process.env;
    if (LOCALLAUNCH || PAT) {
        if (ENABLE_MULTIPLE_ACCOUNT) {
            let muti_acco = multiple_account.length
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
                    const mode = process.env.lottery_mode;
                    const help_msg = "用法: lottery [OPTIONS]\n\nOPTIONS:\n\tstart 启动抽奖\n\tcheck 中奖检查\n\tclear 清理动态和关注\n";
                    switch (mode) {
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
                        case 'help':
                            console.log(help_msg);
                            break;
                        case undefined:
                            console.log(`错误: 未提供以下参数\n\t[OPTIONS]\n`);
                            console.log(help_msg);
                            break
                        default:
                            console.log(`错误: 提供了错误的[OPTIONS] -> ${mode}\n`)
                            console.log(help_msg);
                    }
                }
            } else {
                tooltip.log('请查看README文件, 在env.js指定位置填入cookie')
            }
        }
    } else {
        tooltip.log('请查看README文件, 填入相应的PAT, 若是本地运行则设LOCALLAUNCH为true');
    }
}

(async function () {
    let metainfo = '';
    metainfo += `  _           _   _                   _____           _       _   \n`;
    metainfo += ` | |         | | | |                 / ____|         (_)     | |  \n`;
    metainfo += ` | |     ___ | |_| |_ ___ _ __ _   _| (___   ___ _ __ _ _ __ | |_ \n`;
    metainfo += ` | |    / _ \\| __| __/ _ \\ '__| | | |\\___ \\ / __| '__| | '_ \\| __|\n`;
    metainfo += ` | |___| (_) | |_| ||  __/ |  | |_| |____) | (__| |  | | |_) | |_ \n`;
    metainfo += ` |______\\___/ \\__|\\__\\___|_|   \\__, |_____/ \\___|_|  |_| .__/ \\__|\n`;
    metainfo += `                                __/ |                  | |        \n`;
    metainfo += `                               |___/                   |_|        \n`;
    metainfo += `                                                                  \n`;
    metainfo += `                                                       by shanmite\n`;
    console.log(metainfo);
    /**OPTIONS */
    process.env.lottery_mode = process.argv[2]
    await main();
    tooltip.log('5秒后自动退出');
    await delay(5 * 1000);
    process.exit(0)
})()