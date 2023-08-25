const { getRemoteConfig, getRandomOne, createDir, createFile, dyids_dir } = require("../utils");
const config = require("../data/config");

let global_var = {
    inner: {},
    get(key) {
        return this.inner[key]
    },
    set(key, value) {
        this.inner[key] = value
    },
    /**
     * 全局变量初始化
     * 更新config
     * @param {string} cookie
     * @param {string} num
     */
    async init(cookie, num) {
        if (cookie) {
            const
                key_map = new Map([
                    ['DedeUserID', 'myUID'],
                    ['bili_jct', 'csrf']]),
                LotteryOrderMap = new Map([
                    [0, "UIDs"],
                    [1, "TAGs"],
                    [2, "Articles"],
                    [3, "APIs"],
                    [4, "TxT"],
                ]);

            config.updata(num);

            if (!/buvid3/.test(cookie)) {
                const charset = "0123456789ABCDEF".split("");
                const buvid3 = "x".repeat(8).split("").map(() => getRandomOne(charset)).join("")
                    + "-"
                    + "x".repeat(4).split("").map(() => getRandomOne(charset)).join("")
                    + "-"
                    + "x".repeat(4).split("").map(() => getRandomOne(charset)).join("")
                    + "-"
                    + "x".repeat(4).split("").map(() => getRandomOne(charset)).join("")
                    + "-"
                    + "x".repeat(17).split("").map(() => getRandomOne(charset)).join("")
                    + "infoc";
                this.set('cookie', cookie + ";" + buvid3);
            } else {
                this.set('cookie', cookie);
            }

            cookie.split(/\s*;\s*/).forEach(item => {
                const _item = item.split('=');
                if (key_map.has(_item[0]))
                    this.set(key_map.get(_item[0]), _item[1]);
            });

            const { LotteryOrder } = config;
            this.set('Lottery',
                LotteryOrder
                    .map(it => LotteryOrderMap.get(it))
                    .filter(it => typeof it === "string")
                    .map(lottery_option => config[lottery_option].map(it => [lottery_option, it]))
                    .flat()
            );
            this.set('remoteconfig', await getRemoteConfig());
        }
        await createDir('dyids');
        await createFile(dyids_dir, num < 2 ? 'dyid.txt' : `dyid${num}.txt`, '', 'a')
    }
};


module.exports = global_var;
