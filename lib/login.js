const { readFileSync, writeFileSync } = require('fs');
const { log } = require("./utils");
const path = require('path');
const env_path = path.join(path.resolve(__dirname, '..'), "env.js")

/*
* 扫码登陆
* @param {string} num
*/
async function login(num) {
    try {
        const { pcLogin } = await require('@catlair/blogin');
        const loginInfo = await pcLogin();
        if (!loginInfo) {
            log.error("登录状态","失败/取消");
            return;
        }
        log.info("登录状态","登录成功");
        JSON.stringify(loginInfo, null, 2);
        const uid = `${loginInfo.mid}`;
        const cookie = `${loginInfo.cookie}`;
        log.info("账号UID", uid);
        log.info("cookie", cookie);
        if (replaceCookie(env_path, uid, cookie)) {
            log.info("说明",`账号${num}已进行cookie自动更新，如未能生效请手动复制在env.js内替换。路径：${env_path}`);
            return;
        }
    } catch (error) {
        if (error?.message?.includes('Cannot find module')) {
            log.error('请先运行 yarn add @catlair/blogin');
            return;
        }
        log.error(error);
    }
}

/*
* 正则检索uid更新cookie
* @param {string} filePath
* @param {string} uid
* @param {string} oldCK
*/
async function replaceCookie(filePath,uid,oldCK) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const DedeUserID = `DedeUserID=${uid}`;
        const reg = new RegExp(`['"]?COOKIE['"]?:\\s?['"](.*${DedeUserID}.*)['"]`, 'g');
        const newCK = content.replaceAll(reg, substring => {
            let quote = substring.at(0) || '';
            /['"]/.test(quote) || (quote = '');
            const quote2 = oldCK.includes("'")
                ? '"'
                : substring.match(/^['"]?COOKIE['"]?:\s?(['"])/)?.[1] || '"';
            return `${quote}COOKIE${quote}: ${quote2}${oldCK}${quote2}`;
        });
        if (content === newCK) return false;
        writeFileSync(filePath, newCK);
        return true;
    } catch (error) {
        log.error("替换错误",error);
    }
    return false;
}

module.exports = { login }