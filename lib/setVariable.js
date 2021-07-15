const Base = require("./Base");
const GlobalVar = require("./GlobalVar");
const config = require("./config");

const key_map = new Map([['DedeUserID', 'myUID'], ['bili_jct', 'csrf']]);

/**
 * 生成全局变量文件
 * @param {string} cookie
 * @param {number} n
 */
async function setVariable(cookie, n) {
    if (cookie) {
        config.updata(process.env.NUMBER);

        GlobalVar.set('cookie', cookie);
        cookie.split(/\s*;\s*/).forEach(item => {
            const _item = item.split('=');
            if (key_map.has(_item[0]))
                GlobalVar.set(key_map.get(_item[0]), _item[1]);
        });
        GlobalVar.set('Lottery', [...config.UIDs, ...config.TAGs]);
        GlobalVar.set('remoteconfig', await Base.getRemoteConfig());
    }
    await Base.createDir('dyids');
    await Base.createFile(n < 2 ? 'dyid.txt' : `dyid${n}.txt`, '', 'a')
    return
}


module.exports = { setVariable };