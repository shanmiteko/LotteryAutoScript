const { env_file } = require('../utils');

const env = {
    /**
     * 原始环境
     * @returns {Object}
     */
    raw_env() {
        delete require.cache[env_file];
        return require(env_file);
    },
    init() {
        const raw_env = this.raw_env();
        this.setEnv({
            ...raw_env['account_parm'],
            ...raw_env['push_parm']
        });
    },
    /**
     * @returns {Object[]}
     */
    get_multiple_account() {
        return this.raw_env()['multiple_account_parm'];
    },
    setEnv(o) {
        process.env = {
            ...process.env,
            ...o
        };
    }
};


module.exports = env;