const { env_file, config_file, log, delay, hasFileOrDir } = require("./lib/Util");

const metainfo = [
    `  _           _   _                   _____           _       _   `,
    ` | |         | | | |                 / ____|         (_)     | |  `,
    ` | |     ___ | |_| |_ ___ _ __ _   _| (___   ___ _ __ _ _ __ | |_ `,
    ` | |    / _ \\| __| __/ _ \\ '__| | | |\\___ \\ / __| '__| | '_ \\| __|`,
    ` | |___| (_) | |_| ||  __/ |  | |_| |____) | (__| |  | | |_) | |_ `,
    ` |______\\___/ \\__|\\__\\___|_|   \\__, |_____/ \\___|_|  |_| .__/ \\__|`,
    `                                __/ |                  | |        `,
    `                               |___/                   |_|        `,
    `                                                                  `,
    `                                              v2.0.0   by shanmite`,
]
/**多账号存储 */
let multiple_account = [];
/**循环等待时间 */
let loop_wait = 0;

/**
 * @returns {Promise<string>} 错误信息
 */
async function main() {
    const { COOKIE, NUMBER, CLEAR, ENABLE_MULTIPLE_ACCOUNT, MULTIPLE_ACCOUNT_PARM } = process.env;
    if (ENABLE_MULTIPLE_ACCOUNT) {
        let muti_acco = multiple_account.length
            ? multiple_account
            : JSON.parse(MULTIPLE_ACCOUNT_PARM);

        process.env.ENABLE_MULTIPLE_ACCOUNT = '';

        for (const acco of muti_acco) {
            process.env.COOKIE = acco.COOKIE;
            process.env.NUMBER = acco.NUMBER;
            process.env.CLEAR = acco.CLEAR;
            const err_msg = await main();
            if (err_msg) {
                return err_msg
            } else {
                await delay(acco.WAIT);
            }
        }

        /**多账号状态还原 */
        process.env.ENABLE_MULTIPLE_ACCOUNT = ENABLE_MULTIPLE_ACCOUNT;
    } else {
        if (!COOKIE) {
            return '请查看README文件, 在env.js指定位置填入cookie'
        }
        const { setVariable } = require("./lib/setVariable");
        await setVariable(COOKIE, Number(NUMBER));

        const { start, isMe, checkCookie } = require("./lib/lottery-in-nodejs");
        const { clear } = require("./lib/clear");

        log.info('main', '当前为第' + NUMBER + '个账号');

        if (await checkCookie(NUMBER)) {
            const mode = process.env.lottery_mode;
            const help_msg = "用法: lottery [OPTIONS]\n\nOPTIONS:\n\tstart 启动抽奖\n\tcheck 中奖检查\n\tclear 清理动态和关注\n\thelp 帮助信息";
            const { lottery_loop_wait, check_loop_wait, clear_loop_wait } = require("./lib/config");
            switch (mode) {
                case 'start':
                    log.info('抽奖', '开始运行');
                    loop_wait = lottery_loop_wait;
                    await start();
                    break;
                case 'check':
                    log.info('中奖检测', '检查是否中奖');
                    loop_wait = check_loop_wait;
                    await isMe();
                    break;
                case 'clear':
                    if (CLEAR) {
                        log.info('清理动态', '开始运行');
                        loop_wait = clear_loop_wait;
                        await clear();
                    }
                    break;
                case 'help':
                    return help_msg
                case undefined:
                    return "未提供以下参数\n\t[OPTIONS]\n\n" + help_msg
                default:
                    return `提供了错误的[OPTIONS] -> ${mode}\n\n` + help_msg
            }
        }
    }
}

(async function () {
    log.proPrint(metainfo, '\n')

    if (hasFileOrDir(env_file)) {
        const { initEnv, multiple_account_parm } = require(env_file);
        if (multiple_account_parm) {
            multiple_account = multiple_account_parm;
        }
        initEnv();
        log.init();
        log.info('环境变量初始化', '成功加载env.js文件');
    } else {
        log.init();
        log.warn('环境变量初始化', '未在当前目录下找到env.js文件 也可在环境变量中设置所需参数');
        return
    }

    if (hasFileOrDir(config_file)) {
        require("./lib/config");
        log.info('配置文件初始化', '成功加载my_config.js文件');
    } else {
        log.error('配置文件初始化', '未在当前目录下找到my_config.js文件');
        return
    }

    /**OPTIONS */
    process.env.lottery_mode = process.argv[2]

    const err_msg = await main();
    if (err_msg) {
        log.error('错误', '\n' + err_msg + '\n');
        log.warn('结束运行', '5秒后自动退出');
        await delay(5 * 1000);
    } else {
        while (loop_wait) {
            log.info('程序休眠', `${loop_wait / 1000}秒后再次启动`)
            await delay(loop_wait)
            await main()
        }
        log.info('结束运行', '未设置休眠时间')
    }

    process.exit(0);
})()