const { readFileSync, writeFileSync } = require('fs');
const { log, env_file } = require('./utils');

/**
 * 扫码登陆
 * @param {string} num
 */
async function login(num) {
    try {
        const { pcLogin } = require('@catlair/blogin');
        const loginInfo = await pcLogin();
        if (!loginInfo) {
            log.error('扫码登陆', '失败/取消');
            return;
        }
        log.info('扫码登陆', '登录成功');
        JSON.stringify(loginInfo, null, 2);
        const uid = `${loginInfo.mid}`;
        const cookie = `${loginInfo.cookie}`;
        log.info('账号UID', uid);
        log.info('Cookie', cookie);
        if (replaceCookie(env_file, uid, cookie)) {
            log.info('扫码登陆', `账号${num}已进行cookie自动更新,如未能生效请手动复制在env.js内替换。路径:${env_file}`);
        }
    } catch (error) {
        log.error(error);
    }
}

/**
 * 正则检索uid更新cookie
 * @param {string} filePath
 * @param {string} uid
 * @param {string} oldCK
 */
function replaceCookie(filePath, uid, oldCK) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const DedeUserID = `DedeUserID=${uid}`;
        const reg = new RegExp(`['"]?COOKIE['"]?:\\s?['"](.*${DedeUserID}.*)['"]`, 'g');
        const newCK = content.replaceAll(reg, substring => {
            let quote = substring.at(0) || '';
            /['"]/.test(quote) || (quote = '');
            const quote2 = oldCK.includes('\'')
                ? '"'
                : substring.match(/^['"]?COOKIE['"]?:\s?(['"])/)?.[1] || '"';
            return `${quote}COOKIE${quote}: ${quote2}${oldCK}${quote2}`;
        });
        if (content === newCK) return false;
        writeFileSync(filePath, newCK);
        return true;
    } catch (error) {
        log.error('扫码登陆', error);
    }
    return false;
}

module.exports = { login };