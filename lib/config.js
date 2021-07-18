const { config_file } = require('./Util');
const my_config = require(config_file);

const config = {
    ...my_config["default_config"],
    /**
     * @param {string} n
     */
    updata(n) {
        const new_config = my_config[`config_${n}`];
        if (new_config) {
            Object.entries(new_config)
                .forEach(([k, v]) => this[k] = v)
        }
    }
};


module.exports = config;