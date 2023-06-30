module.exports = Object.freeze({
    /**
     * ## 账号相关
     * - `COOKIE` 是必填项
     * - `NOTE` 帐号备注
     * - `NUMBER` 表示是第几个账号
     * - `CLEAR` 是否启用清理功能
     * - `ENABLE_MULTIPLE_ACCOUNT` 是否启用多账号
     * - `MULTIPLE_ACCOUNT_PARM` 多账号参数(JSON格式)
     * ## 代理相关
     * - `ENABLE_PROXY` 启用代理
     * - `XMDL_ORDERNNO` 熊猫动态代理订单号
     * - `XMDL_SECRET` 熊猫动态代理密钥
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
    account_parm: {
        COOKIE: "",
        NOTE: "",
        NUMBER: 1,
        CLEAR: true,

        ENABLE_MULTIPLE_ACCOUNT: false,

        ENABLE_PROXY: "",
        XMDL_ORDERNNO: "",
        XMDL_SECRET: "",

        MULTIPLE_ACCOUNT_PARM: "",
        LOTTERY_LOG_LEVEL: 3,
        NOT_GO_LOTTERY: ""
    },

    /**
     * 为防止环境变量过长, 请将多账号填在此处
     * 以 **大括号内容** 为模板依次复制(包含大括号),逗号分割
     * 
     * ```txt
     * [
     *     {
     *     ...
     *     NUMBER: 1
     *     ...
     *     },
     *     {
     *     ...
     *     NUMBER: 2
     *     ...
     *     }
     * ]
     * ```
     */
    multiple_account_parm: [
        {
            COOKIE: "",
            NOTE: "",
            NUMBER: 1,
            CLEAR: true,
            WAIT: 60 * 1000
        }
    ],

    /**
     * 推送相关参数
     */
    push_parm: {
        SCKEY: "",
        SENDKEY: "",
        QQ_SKEY: "",
        QQ_MODE: "",
        BARK_PUSH: "",
        BARK_SOUND: "",
        PUSHDEER_URL: "",
        PUSHDEER_PUSHKEY: "",
        TG_BOT_TOKEN: "",
        TG_USER_ID: "",
        TG_PROXY_HOST: "",
        TG_PROXY_PORT: "",
        DD_BOT_TOKEN: "",
        DD_BOT_SECRET: "",
        QYWX_AM: "",
        QYWX_KEY: "",
        IGOT_PUSH_KEY: "",
        PUSH_PLUS_TOKEN: "",
        PUSH_PLUS_USER: "",
        QMSG_KEY: "",
        QMSG_QQ: "",
        SMTP_HOST: "",
        SMTP_PORT: "",
        SMTP_USER: "",
        SMTP_PASS: "",
        SMTP_TO_USER: ""
    }
})