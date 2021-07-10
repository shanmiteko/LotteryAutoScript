module.exports = {
    /** 
     * 默认设置(公用)
     */
    default_config: {
        /**
         * - '00' 关闭自动抽奖
         * - '10' 只转发官方抽奖
         * - '01' 只转发非官方抽奖
         * - '11' 都转
         */
        model: '11',

        /**
         * - '00'关闭自动评论
         * - '10'只评论官抽
         * - '01'只评论非官抽
         * - '11'都评论
         */
        chatmodel: '01',

        /**
         * 不加判断的转发所监视的uid转发的动态
         */
        is_imitator: false,

        /**
         * - 在uid或tag里检索的页数
         */
        scan_page_num: 3,

        /**
         * - 开奖时间距离现在的最大天数
         * - 默认不限制
         */
        maxday: Infinity,

        /**
         * - 转发间隔时间
         * - 单位毫秒
         * - 上下浮动50%
         */
        wait: 100000,

        /**
         * - 检索动态间隔
         * - 单位毫秒
         */
        search_wait: 1000,

        /**
         * - up主粉丝数限制
         */
        minfollower: 1000,

        /**
         * 粉丝数限制是否跳过有官方认证的up
         */
        skip_official_verify: true,

        /**
         * - 只转发已关注的
         */
        only_followed: false,

        /**
         * - 是否发送随机动态(防止被开奖机过滤)
         */
        create_dy: false,

        /**
         * - 发送随机动态的数量
         */
        create_dy_num: 1,

        /**
         * - 随机动态内容
         * - 类型 `content[]`
         */
        /**
         * @typedef Picture
         * @property {string} img_src 站内源
         * @property {number} img_width
         * @property {number} img_height
         * @param { string | Picture[] } content
         */
        dy_contents: ['[doge]', '[doge][doge]'],

        /**
         * 转发时[at]的用户
         */
        at_users: [['转发抽奖娘', 294887687], ['你的工具人老公', 100680137]],

        /**
         * 同步 https://gitee.com/shanmite/lottery-notice/raw/master/notice.json
         */
        blacklist: '1,2',

        /**
         * 屏蔽词
         */
        blockword: ["脚本抽奖", "恭喜", "结果", "抽奖号"],

        /**
         * 取关白名单
         */
        followWhiteList: '1,2',

        /**
         * 转发评语
         */
        relay: ['转发动态'],

        /**
         * 评论内容
         */
        chat: [
            '[OK]', '[星星眼]', '[歪嘴]', '[喜欢]', '[偷笑]', '[笑]', '[喜极而泣]', '[辣眼睛]', '[吃瓜]', '[奋斗]',
            '永不缺席 永不中奖 永不放弃！', '万一呢', '在', '冲吖~', '来了', '万一', '[保佑][保佑]', '从未中，从未停', '[吃瓜]', '[抠鼻][抠鼻]',
            '来力', '秋梨膏', '[呲牙]', '从不缺席', '分子', '可以', '恰', '不会吧', '1', '好',
            'rush', '来来来', 'ok', '冲', '凑热闹', '我要我要[打call]', '我还能中！让我中！！！', '大家都散了吧，已经抽完了，是我的', '我是天选之子', '给我中一次吧！',
            '坚持不懈，迎难而上，开拓创新！', '[OK][OK]', '我来抽个奖', '中中中中中中', '[doge][doge][doge]', '我我我',
        ],

        /**
         * 抽奖UP用户分组id(网页端点击分区后地址栏中的tagid)
         */
        partition_id: 0,

        /**
         * 是否关注异常
         */
        is_exception: false,

        /**
         * 取关分区
         */
        clear_partition: '',

        /**
         * 清理多少天内的动态或关注
         */
        clear_max_day: 30,

        /**
         * 是否移除动态
         */
        clear_remove_dynamic: true,

        /**
         * 是否移除关注
         */
        clear_remove_attention: true,

        /**
         * 清除动态延时(毫秒)
         */
        clear_remove_delay: 8000,

        /**
         * 清除动态类型
        | 动态类型   | type值 |
        | ---------- | ------ |
        | 无         | `0`    |
        | 转发       | `1`    |
        | 含图片     | `2`    |
        | 无图纯文字 | `4`    |
        | 视频       | `8`    |
        | 专栏       | `64`   |
        | 活动       | `2048` |
         */
        clear_dynamic_type: 1
    },

    /**
     * 针对某一账号的特别设置
     * config_[数字] 依次类推
     */
    config_1: {},
    config_2: {},
    config_3: {}
}

