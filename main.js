const { version: ve, env_file, config_file, log, hasEnv, delay, hasFileOrDir } = require("./lib/utils");

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
    `    This: v${ve}     Nodejs: ${process.version}     Written By shanmite`,
]
/**多账号存储 */
let multiple_account = [];
/**循环等待时间 */
let loop_wait = 0;

/**
 * @returns {Promise<string>} 错误信息
 */
async function main() {
    const { COOKIE, NOTE, NUMBER, CLEAR, ENABLE_MULTIPLE_ACCOUNT, MULTIPLE_ACCOUNT_PARM } = process.env;
    if (ENABLE_MULTIPLE_ACCOUNT) {
        let muti_acco = multiple_account.length
            ? multiple_account
            : JSON.parse(MULTIPLE_ACCOUNT_PARM);

        process.env.ENABLE_MULTIPLE_ACCOUNT = '';

        for (const acco of muti_acco) {
            process.env.COOKIE = acco.COOKIE;
            process.env.NUMBER = acco.NUMBER;
            process.env.CLEAR = acco.CLEAR;
            process.env.NOTE = acco.NOTE;
            const err_msg = await main();
            if (err_msg) {
                return err_msg
            } else {
                await delay(acco.WAIT);
            }
        }

        /**多账号状态还原 */
        process.env.ENABLE_MULTIPLE_ACCOUNT = ENABLE_MULTIPLE_ACCOUNT;
    } else if (COOKIE) {
        const global_var = require("./lib/data/global_var");
        await global_var.init(COOKIE, NUMBER);

        /**引入基础功能 */
        const { start, isMe, clear, checkCookie } = require("./lib/index");

        log.info('main', '当前为第' + NUMBER + '个账号');

        if (await checkCookie(NUMBER)) {
            const mode = process.env.lottery_mode;
            const help_msg = "用法: lottery [OPTIONS]\n\nOPTIONS:\n\tstart 启动抽奖\n\tcheck 中奖检查\n\tclear 清理动态和关注\n\tupdate 检查更新\n\thelp 帮助信息";
            const { lottery_loop_wait, check_loop_wait, clear_loop_wait } = require("./lib/data/config");
            switch (mode) {
                case 'start':
                    log.info('抽奖', '开始运行');
                    loop_wait = lottery_loop_wait;
                    await start(NUMBER);
                    break;
                case 'check':
                    log.info('中奖检测', '检查是否中奖');
                    loop_wait = check_loop_wait;
                    await isMe(NUMBER, NOTE);
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
        } else {
            log.error('Cookie已失效', '切换账号时不要点击退出账号而应直接删除Cookie退出')
            return
        }
    } else {
        return '请查看README文件, 在env.js指定位置填入cookie'
    }
}

/**
 * 初始化环境
 * @returns {boolean} 出错true
 */
function initEnv() {
    if (hasFileOrDir(env_file)) {
        const
            env = require("./lib/data/env"),
            multiple_account_parm = env.get_multiple_account();

        if (multiple_account_parm) {
            multiple_account = multiple_account_parm;
        }

        env.init();
        log.init();
        log.info('环境变量初始化', '成功加载env.js文件');
    } else if (hasEnv('COOKIE') || hasEnv('MULTIPLE_ACCOUNT_PARM')) {
        log.init();
        log.info('环境变量初始化', '成功从环境变量中读取COOKIE设置');
    } else {
        log.init();
        log.error('环境变量初始化', '未在当前目录下找到env.js文件或者在环境变量中设置所需参数');
        return true
    }

    return false
}

/**
 * 初始化设置
 * @returns {boolean} 出错true
 */
function initConfig() {
    if (hasFileOrDir(config_file)) {
        const config = require("./lib/data/config");
        config.init();
        log.info('配置文件初始化', '成功加载my_config.js文件');
    } else {
        log.error('配置文件初始化', '未在当前目录下找到my_config.js文件');
        return true
    }

    return false
}

(async function () {
    log.rainbow(metainfo)

    if (initEnv() || initConfig()) return;

    /**OPTIONS */
    process.env.lottery_mode = process.argv[2]

    if (process.env.lottery_mode === "update") {
        log.info('检查更新', '开始')
        await require("./lib/update").update()
        log.info('检查更新', '请手动解压替换可执行文件')
        return
    }

    const err_msg = await main();
    if (err_msg) {
        log.error('错误', err_msg);
        log.warn('结束运行', '5秒后自动退出');
        await delay(5 * 1000);
    } else {
        while (loop_wait) {
            log.info('程序休眠', `${loop_wait / 1000}秒后再次启动`)
            await delay(loop_wait)
            if (initEnv() || initConfig()) return;
            await main()
        }
        log.info('结束运行', '未在config.js中设置休眠时间')
    }

    process.exit(0);
})()