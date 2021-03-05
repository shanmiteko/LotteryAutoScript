const fs = require('fs');
const path = require('path');
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
     * 
     * @returns {Promise<import("./BiliAPI").Pictures[]>}
     */
    getPictures: () => {
        return new Promise((resolve, reject) => {
            HttpRequest({
                method: 'GET',
                url: 'https://gitee.com/shanmite/lottery-notice/raw/master/pictures.json',
                config: {
                    retry: false,
                },
                success: res => {
                    try {
                        let { img_src } = JSON.parse(res.body);
                        resolve([0, 0].map(() => img_src[~~(Math.random() * img_src.length)]))
                    } catch (_) {
                        reject('[doge][doge][doge]')
                    }
                },
                failure: () => {
                    reject('[doge][doge][doge]')
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
    transformTimeZone: (ts, zoneOffset) => new Date(new Date(ts).getTime() + zoneOffset * 60 * 60 * 1000).toLocaleString(),
    /**
     * ifNotExistCreateFile
     * @param {string} filepath 相对于lib的文件路径
     * @param {string} [defaultValue] 写入默认值
     * @returns {Promise<void>}
     */
    ifNotExistCreateFile: (filepath, defaultValue = '') => {
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
    },
    /**
     * 读取dyid文件
     * @returns {fs.ReadStream}
     */
    readDyidFile: () => {
        const fpath = path.join('./lib', 'dyid.txt');
        return fs.createReadStream(fpath, { encoding: 'utf8', highWaterMark: 19 * 1000 })
    },
    /**
     * 追加dyid
     * @returns {fs.WriteStream}
     */
    writeDyidFile: () => {
        const fpath = path.join('./lib', 'dyid.txt');
        return fs.createWriteStream(fpath, { flags: 'a' })
    }
};

module.exports = Base;