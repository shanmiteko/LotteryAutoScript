const bili = require('./net/bili')
const { log } = require('./utils')

async function account() {
    const my_info = await bili.getMyinfo();
    const stat = await bili.getStat();
    if (my_info && stat) {
        log.info("帐号信息", `${my_info.name} Lv${my_info.level} ${my_info.silence ? "已封禁" : "未封禁"} 升级还需${my_info.level_exp.next_exp - my_info.level_exp.current_exp}经验`)
        log.info("帐号信息", `当前关注数:${stat.following} 粉丝数:${stat.follower} 动态数量:${stat.dynamic_count}`)
    } else {
        log.error("帐号信息", "获取失败");
    }
}

module.exports = { account }