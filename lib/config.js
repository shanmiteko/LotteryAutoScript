const { config_file, tooltip } = require('./Base');

const my_config = (() => {
    let _my_config = {}
    try {
        _my_config = require(config_file)
    } catch (e) {
        tooltip.log("[config]自定义设置异常 原因如下:\n" + e);
    }
    return _my_config;
})();

const config = {
    ...my_config["default_config"],
    /**
     * @param {string} n
     */
    updata(n) {
        const new_config = my_config[`config_${n}`] || {};
        Object.entries(new_config)
            .forEach(([k, v]) => this[k] = v)
    }
};


module.exports = config;