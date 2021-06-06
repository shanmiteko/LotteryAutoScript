const { config_file, tooltip } = require('./Base');

const default_script = {
    author: '@shanmite',
    UIDs: [
        31252386,
        35719643,
        689277291
    ],
    TAGs: [
        '互动抽奖',
        '抽奖',
        '转发抽奖',
        '动态抽奖',
    ]
};

/**
 * 自己修改过的设置
 */
const my_config = (() => {
    let _my_config = {}
    if (process.env.LOCALLAUNCH) {
        try {
            const { UIDs, TAGs } = require(config_file);
            if (UIDs) _my_config.UIDs = UIDs;
            if (TAGs) _my_config.TAGs = TAGs;
        } catch (e) {
            tooltip.log("[script]无自定义设置\n" + e);
        }
    } else {
        try {
            const { MY_CONFIG } = process.env;
            if (MY_CONFIG) {
                const { UIDs, TAGs } = JSON.parse(MY_CONFIG);
                if (UIDs) _my_config.UIDs = UIDs;
                if (TAGs) _my_config.TAGs = TAGs;
            }
        } catch (_) {
            tooltip.log("[script]MY_CONFIG语法错误");
        }
    }
    return _my_config;
})();

const script = {
    ...default_script,
    ...my_config
}


module.exports = script;
