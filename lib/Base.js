const { HttpRequest } = require("./HttpRequest");

/**
 * 基础工具
 */
const Base = {
    /**
     * 安全的将JSON字符串转为对象
     * 超出精度的数转为字符串
     * @param {string} params
     * @return {object}
     * 返回对象
     */
    strToJson(params) {
        const isJSON = (str => {
            if (typeof str === 'string') {
                try {
                    const obj = JSON.parse(str);
                    return typeof obj === 'object' ? obj : false
                } catch (_) {
                    console.log(str);
                    return false;
                }
            } else {
                console.log(`${str}\nIt is not a string!`);
                return false;
            }
        })(params);
        return isJSON ? isJSON : {}
    },
    /**
     * 函数柯里化
     * @param {function} func
     * 要被柯里化的函数
     * @returns {function}
     * 一次接受一个参数并返回一个接受余下参数的函数
     */
    curryify: func => {
        function _c(restNum, argsList) {
            return restNum === 0 ?
                func.apply(null, argsList) :
                function (x) {
                    return _c(restNum - 1, argsList.concat(x));
                };
        }
        return _c(func.length, []);
    },
    /**
     * 延时函数
     * @param {number} time ms
     * @returns {Promise<void>}
     */
    delay: time => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    },
    /**
     * 计数器 0..Infinity
     * @typedef Counter
     * @property {()=>Number} next
     * @property {()=>boolean} clear
     * @property {()=>Number} value
     * @returns {Counter}
     */
    counter() {
        let c = {
            i: 0,
            next: () => c.i++,
            clear: () => { c.i = 0 },
            value: () => c.i
        }
        return c
    },
    /**
     * 随机获取字符串数组中的字符串
     * @param {string[]} arr
     * @returns {string}
     */
    getRandomStr: arr => {
        return arr[parseInt(Math.random() * arr.length)];
    },
    /**
     * 一言接口
     * @returns {Promise<string>}
     */
    getHiToKoTo() {
        return new Promise(resolve => {
            HttpRequest({
                method: 'GET',
                url: 'https://v1.hitokoto.cn/',
                query: {
                    encode: 'json',
                    c: 'i'
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                    Accept: 'text/plain, */*',
                },
                success: res => {
                    const { hitokkoto } = this.strToJson(res.body);
                    if (hitokkoto && (Date.now() % 7)) {
                        resolve(hitokkoto)
                    } else {
                        resolve('发条动态证明自己是真人[doge][doge][doge]')
                    }
                },
                failure: () => {
                    resolve('发条动态证明自己是真人[doge][doge][doge]')
                }
            })
        });
    },
    /**
     * 提取开奖信息
     * @param {string} des 描述
     * @returns {
            {
                ts: number|0;
                text:string|'开奖时间: 未填写开奖时间';
                item:string|'请自行查看';
                isMe:string|'请自行查看';
            }
     * }
     */
    getLotteryNotice(des) {
        const r = /([\d零一二两三四五六七八九十]+)[.月]([\d零一二两三四五六七八九十]+)[日号]?/;
        if (des === '') return {
            ts: 0,
            text: `开奖时间: 未填写开奖时间`,
            item: '请自行查看',
            isMe: '请自行查看'
        }
        const _date = r.exec(des) || [];
        const timestamp10 = ((month, day) => {
            if (month && day) {
                let date = new Date(`${new Date(Date.now()).getFullYear()}-${month}-${day} 23:59:59`).getTime()
                if (!isNaN(date)) return date / 1000;
            }
            return 0
        })(_date[1], _date[2])
        if (timestamp10 === 0) return {
            ts: 0,
            text: `开奖时间: 未填写开奖时间`,
            item: '请自行查看',
            isMe: '请自行查看'
        }
        const timestamp13 = timestamp10 * 1000,
            time = new Date(timestamp13);
        const remain = (() => {
            const timestr = ((timestamp13 - Date.now()) / 86400000).toString()
                , timearr = timestr.replace(/(\d+)\.(\d+)/, "$1,0.$2").split(',');
            const text = timearr[0][0] === '-' ? `开奖时间已过${timearr[0].substring(1)}天余${parseInt(timearr[1] * 24)}小时` : `还有${timearr[0]}天余${parseInt(timearr[1] * 24)}小时`;
            return text
        })();
        return {
            ts: timestamp10,
            text: `开奖时间: ${time.toLocaleString()} ${remain}`,
            item: '请自行查看',
            isMe: '请自行查看'
        };
    },
    /**
     * 获取远程设置
     * @returns {Promise<JSON>}
     */
    getRemoteConfig: () => new Promise((resolve) => {
        HttpRequest({
            method: 'GET',
            url: 'https://gitee.com/shanmite/lottery-notice/raw/master/notice.json',
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                accept: 'text/plain; charset=utf-8',
                referer: 'https://gitee.com/shanmite/lottery-notice/blob/master/notice.json',
            },
            success: res => {
                try {
                    resolve(JSON.parse(res.body).config)
                } catch (error) {
                    resolve(JSON.parse('{}'))
                }
            },
            failure: err => {
                console.log('获取远程设置错误: ' + err);
                resolve(JSON.parse('{}'));
            }
        })
    }),
    /**
     * 
     * @param {string} ts 13位时间戳
     * @param {number} zoneOffset 东时区记做正数
     */
    transformTimeZone: (ts, zoneOffset) => new Date(new Date(ts).getTime() + zoneOffset * 60 * 60 * 1000).toLocaleString()
};

module.exports = Base;