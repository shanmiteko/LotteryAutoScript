const Base = require("./Base");
const GlobalVar = require("./GlobalVar");
const MyStorage = require("./MyStorage");
const Script = require("./Script");

let __GlobalVar = {
    cookie: '',
    /**自己的UID*/
    myUID: '',
    /**防跨站请求伪造*/
    csrf: '',
    /**
     * 抽奖信息
     * @type {(string|number)[]}
     */
    Lottery: [...Script.UIDs, ...Script.TAGs],
    remoteconfig: {},
}
/**
 * 生成全局变量文件
 * @param {string} cookie
 * @param {number} n
 */
async function setVariable(cookie, n) {
    if (cookie) {
        const key = ['DedeUserID', 'bili_jct']
        __GlobalVar.cookie = cookie;
        cookie.split(/\s*;\s*/).forEach(item => {
            const _item = item.split('=');
            if (key.indexOf(_item[0]) !== -1) __GlobalVar[_item[0]] = _item[1];
        })
        __GlobalVar.csrf = __GlobalVar.bili_jct;
        __GlobalVar.myUID = __GlobalVar.DedeUserID;
        __GlobalVar.remoteconfig = await Base.getRemoteConfig();
        GlobalVar.updateAll(__GlobalVar);
    }
    if (process.env.PAT) {
        await MyStorage.init()
    } else {
        await Base.createFile(n < 2 ? 'dyid.txt' : `dyid${n}.txt`, '', 'a')
    }
    return
}


module.exports = { setVariable };