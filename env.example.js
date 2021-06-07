/**
 * 使用时请将此文件命名为env.js
 * 注: 请打开扩展名显示
 */

/**
 * ## 账号相关参数
 * - `COOKIE` 是必填项
 * - `NUMBER` 表示是第几个账号
 * - `PAT` 与 `GITHUB_REPOSITORY` 如果之前在Github Action上运行过脚本, 可填写已下载转发过的动态dyid, 之后可移除
 * 
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
    LOCALLAUNCH: true,
    PAT: "",
    GITHUB_REPOSITORY: "用户名/仓库名",
    ENABLE_MULTIPLE_ACCOUNT: false
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