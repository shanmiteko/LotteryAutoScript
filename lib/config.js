const { tooltip } = require('./Base');

/**
 * 默认设置 具体含义参见README
 * 如需修改请按照README文件要求填写在指定位置
 * 直接修改文件自动更新时会被重置
 */
const default_config = {
    model: '11',
    chatmodel: '01',
    scan_page_num: 3,
    maxday: '-1',
    wait: '100000',
    minfollower: '1000',
    only_followed: '0',
    create_dy: '1',
    create_dy_num: 1,
    dy_contents: ['[doge]'],
    at_users: [['转发抽奖娘', 294887687], ['你的工具人老公', 100680137]],
    /* 与最新黑名单同步 */
    blacklist: '28008897,28272016,140389827,24598781,28008860,28008880,28008743,28008948,28009292,319696958,90138218,28272000,28272047,28271978,8831288,175979009,3177443,486780865,403048135,474325039,455274996,477519424,292671666,448873224,22498938,1770865,444796995,306112375,320193786,606637517,305276429,204487541,404761800,186914127,99439379,457697569,270886929,477519424,401575,201296348,206804212,333584926,34679178,699923691,392689522,178700744,272882445,350977368,487168411,22682842,444949061,523974463,192231907,503908324,383189098,252909207,336467750,264875137,90721742,452299642,677739290,441522918,8766623,698327474,5439672,483247863,237055308,95404163,202052696,1309889741,627942060,455030741,406353670,18036870,470220612',
    blockword: ["脚本抽奖", "恭喜", "结果", "抽奖号"],
    followWhiteList: '',
    relay: ['转发动态'],
    chat: [
        '[OK]', '[星星眼]', '[歪嘴]', '[喜欢]', '[偷笑]', '[笑]', '[喜极而泣]', '[辣眼睛]', '[吃瓜]', '[奋斗]',
        '永不缺席 永不中奖 永不放弃！', '万一呢', '在', '冲吖~', '来了', '万一', '[保佑][保佑]', '从未中，从未停', '[吃瓜]', '[抠鼻][抠鼻]',
        '来力', '秋梨膏', '[呲牙]', '从不缺席', '分子', '可以', '恰', '不会吧', '1', '好',
        'rush', '来来来', 'ok', '冲', '凑热闹', '我要我要[打call]', '我还能中！让我中！！！', '大家都散了吧，已经抽完了，是我的', '我是天选之子', '给我中一次吧！',
        '坚持不懈，迎难而上，开拓创新！', '[OK][OK]', '我来抽个奖', '中中中中中中', '[doge][doge][doge]', '我我我',
    ],
    partition_id: 0,
    is_exception: false,
    clear_partition: '',
    clear_max_day: 30,
    clear_remove_all_force: false,
    clear_remove_dynamic: true,
    clear_remove_attention: true,
};

/**
 * 自己修改过的设置
 */
const my_config = (() => {
    let _my_config = {}
    if (process.env.LOCALLAUNCH) {
        try {
            _my_config = require('../my_config.json')
        } catch (_) {
            tooltip.log("[config]无自定义设置");
        }
    } else {
        try {
            _my_config = JSON.parse(process.env.MY_CONFIG);
        } catch (_) {
            tooltip.log("[config]MY_CONFIG语法错误");
        }
    }
    return _my_config;
})();

const config = {
    ...default_config,
    /**
     * @param {string} n
     */
    updata(n) {
        const new_config = my_config[`config_${n}`] || my_config;
        Object.entries(new_config)
            .forEach(([k, v]) => this[k] = v)
    }
};


module.exports = config;