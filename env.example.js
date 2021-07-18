/**
 * ## 账号相关
 * - `COOKIE` 是必填项
 * - `NUMBER` 表示是第几个账号
 * - `CLEAR` 是否启用清理功能
 * - `ENABLE_MULTIPLE_ACCOUNT` 是否启用多账号
 * - `MULTIPLE_ACCOUNT_PARM` 多账号参数(JSON格式)
 * ## 调试相关
 * - `LOTTERY_LOG_LEVEL` 输出日志等级 Error<Warn<Info<Debug 1<2<3<4
 * - `NOT_GO_LOTTERY` 关闭抽奖行为
 * ## 多账号
 * 1. 将 ENABLE_MULTIPLE_ACCOUNT 的值改为true
 * 2. 将账号信息依次填写于 multiple_account_parm 中, 参考例子类推
 * - `WAIT` 表示下一个账号运行等待时间(毫秒)
 * 
 * **按顺序依次执行, 防止访问频繁封禁IP**
 */
const account_parm = {
    COOKIE: "",
    NUMBER: 1,
    CLEAR: true,
    ENABLE_MULTIPLE_ACCOUNT: false,
    MULTIPLE_ACCOUNT_PARM: "",
    LOTTERY_LOG_LEVEL: 3,
    NOT_GO_LOTTERY: ""
}

/**
 * 为防止环境变量过长, 请将多账号填在此处
 */
const multiple_account_parm = [
    {
        COOKIE: "",
        NUMBER: 1,
        CLEAR: true,
        WAIT: 60 * 1000,
    },
    // {
    //     COOKIE: "",
    //     NUMBER: 2,
    //     CLEAR: true,
    //     WAIT: 60 * 1000,
    // },
]

/**
 * 推送相关参数
 */
const push_parm = {
    SCKEY: "",
    SENDKEY: "",
    QQ_SKEY: "",
    QQ_MODE: "",
    BARK_PUSH: "",
    BARK_SOUND: "",
    TG_BOT_TOKEN: "",
    TG_USER_ID: "",
    TG_PROXY_HOST: "",
    TG_PROXY_PORT: "",
    DD_BOT_TOKEN: "",
    DD_BOT_SECRET: "",
    QYWX_KEY: "",
    IGOT_PUSH_KEY: "",
    PUSH_PLUS_TOKEN: "",
    PUSH_PLUS_USER: "",
    SMTP_HOST: "",
    SMTP_PORT: "",
    SMTP_USER: "",
    SMTP_PASS: "",
    SMTP_TO_USER: ""
}

/**
 * 初始化环境变量
 */
function initEnv() {
    process.env = {
        ...process.env,
        ...account_parm,
        ...push_parm
    }
}


module.exports = { initEnv, multiple_account_parm };