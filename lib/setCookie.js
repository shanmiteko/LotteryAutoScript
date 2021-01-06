const Script = require("./Script");
const fs = require('fs');
const path = require('path');

/**
 * 
 * @param {string} filepath 相对于根目录的文件路径
 * @param {string} [defaultValue] 写入默认值
 * @returns {Promise<void>}
 */
function ifNotExistCreateFile(filepath, defaultValue = '') {
    const fpath = path.join('./lib', filepath);
    const buffer = Buffer.from(defaultValue);
    return new Promise((resolve, rejects) => {
        fs.open(fpath, 'wx', (err, fd) => {
            if (err) {
                resolve();
            } else {
                fs.write(fd, buffer, 0, buffer.length, 0, err => {
                    if (err) {
                        rejects(err)
                    } else {
                        resolve();
                    }
                })
            }
        })
    });
}

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
    SCKEY: ''
}
/**
 * 生成全局变量文件
 * @param {string} cookie
 * @param {string} [SCKEY]
 */
module.exports = async function setGlobalVar(cookie, SCKEY = '') {
    const key = ['DedeUserID','bili_jct']
    GlobalVar.cookie = cookie;
    GlobalVar.SCKEY = SCKEY;
    cookie.split(/\s*;\s*/).forEach(item=>{
        const _item = item.split('=');
        if (key.indexOf(_item[0]) !== -1) GlobalVar[_item[0]] = _item[1];
    })
    await ifNotExistCreateFile('GlobalVar.json',JSON.stringify(GlobalVar));
    return
}
