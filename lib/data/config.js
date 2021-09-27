const { config_file } = require('../utils');

const config = {
    /**
     * 原始设置
     * @returns {Object}
     */
    raw_config() {
        delete require.cache[config_file];
        return require(config_file)
    },
    /**
     * @param {string} n
     */
    updata(n) {
        const new_config = this.raw_config()[`config_${n}`];
        if (new_config) {
            this.setObject(new_config)
        }
    },
    init() {
        this.setObject(this.raw_config()["default_config"])
    },
    setObject(o) {
        Object.entries(o).forEach(([k, v]) => this[k] = v)
    }
};


module.exports = config;