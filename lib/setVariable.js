const Script = require("./Script");
const MyStorage = require("./MyStorage");
const Base = require("./Base");

let GlobalVar = {
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
    SCKEY: '',
    remoteconfig: {},
}
/**
 * 生成全局变量文件
 * @param {string} cookie
 * @param {string} [PAT]
 * @param {string} [SCKEY]
 * @param {string} [PUSH_PLUS_TOKEN]
 */
async function setVariable(cookie, PAT = '') {
    const key = ['DedeUserID','bili_jct']
    GlobalVar.cookie = cookie;
    cookie.split(/\s*;\s*/).forEach(item=>{
        const _item = item.split('=');
        if (key.indexOf(_item[0]) !== -1) GlobalVar[_item[0]] = _item[1];
    })
    GlobalVar.csrf = GlobalVar.bili_jct;
    GlobalVar.myUID = GlobalVar.DedeUserID;
    GlobalVar.remoteconfig = await Base.getRemoteConfig();
    await Base.ifNotExistCreateFile('GlobalVar.json', JSON.stringify(GlobalVar));
    if (PAT) {
        await MyStorage.init(PAT)
    } else {
        await Base.ifNotExistCreateFile('dyid.txt')
    }
    return
}

module.exports = { setVariable };