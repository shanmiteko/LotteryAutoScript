const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { send } = require("./net/http");
const { version } = require('../package.json');

/**
 * 基础工具
 */
const utils = {
    version,
    /**环境变量设置文件 */
    env_file: path.join(process.cwd(), "env.js"),
    /**配置文件 */
    config_file: path.join(process.cwd(), "my_config.js"),
    /**dyid长度 */
    dyid_length: 18,
    /**
     * 将版本号转为数字
     * @example
     * 1.2.3 => 1.0203
     * @param {string} version
     * @returns {Number}
     */
    checkVersion(version) {
        return (version.match(/\d.*/)[0]).split('.').reduce((a, v, i) => a + (0.01 ** i) * Number(v), 0)
    },
    /**
     * 安全的将JSON字符串转为对象
     * 超出精度的数转为字符串
     * @param {string} params
     * @return {object}
     * 返回对象 解析失败返回 `{}`
     */
    strToJson(params) {
        const isJSON = (str => {
            if (typeof str === 'string') {
                try {
                    const obj = JSON.parse(str);
                    return typeof obj === 'object' ? obj : false
                } catch (_) {
                    return false;
                }
            } else {
                return false;
            }
        })(params);
        return isJSON ? isJSON : {}
    },
    /**
     * @template T
     * @param {Array<T>} iter
     * @param {(value: T) => Promise<Boolean>} fn 返回true整体退出
     */
    async try_for_each(iter, fn) {
        for (const item of iter) {
            if (await fn(item)) break
        }
    },
    /**
     * 函数柯里化
     * @template T
     * @param {(arg, arg) => T} func
     * 要被柯里化的函数
     * @returns {(arg) => (arg) => T)}
     * 一次接受一个参数并返回一个接受余下参数的函数
     */
    curryify(func) {
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
     * @param {number} [time] ms
     * @returns {Promise<void>}
     */
    delay(time = 1000) {
        utils.log.info('时延', `${~~time}ms`);
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
     * 无限序列
     * `[0..]`
     */
    *infiniteNumber() {
        for (let index = 0; ; index++) {
            yield index
        }
    },
    /**
     * 随机获取数组中的一个元素
     * @template T
     * @param {T[]} arr
     * @returns {T}
     */
    getRandomOne(arr) {
        let RandomOne = null;
        if (Array.isArray(arr) && arr.length) {
            RandomOne = arr[parseInt(Math.random() * arr.length)];
        }
        return RandomOne
    },
    /**
     * Fisher–Yates shuffle洗牌
     * @template T
     * @param {Array<T>} array
     * @return {Array<T>}
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    /**
     * 关键词判断 优先级递增
     * @param {string} text
     * @param {string[]} key_words startwith '~' 表示黑名单
     * @return {boolean}
     */
    judge(text, key_words) {
        return key_words.reduce((acc, word) => {
            word.startsWith('~')
                ? RegExp(word.slice(1)).test(text) && (acc = false)
                : RegExp(word).test(text) && (acc = true)
            return acc
        }, false)
    },
    /**
     * 是否有指定环境变量
     * @param {string} env_name
     * @returns 
     */
    hasEnv(env_name) {
        return process.env[env_name] ? true : false;
    },
    /**日志 */
    log: {
        level: 3,
        /**
         * 初始化默认level为3
         */
        init() {
            let _level = Number(process.env.LOTTERY_LOG_LEVEL);
            this.level = isNaN(_level) ? 3 : _level;
        },
        /**
         * @param {String|Array<String>} msg
         * @param {String} [split] 分隔符
         */
        proPrint(msg, split = ' ') {
            if (msg instanceof Array) {
                msg = msg.join(split)
            }
            console.log(msg)
        },
        /**
         * @param {Array<string>} msg
         * @returns
         */
        rainbow(msg) {
            const
                colors = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'],
                colorsCount = colors.length;

            this.proPrint(msg.map(it => it.split('').map((l, i) => chalk[colors[i % colorsCount]](l)).join('')), '\n')
        },
        debug(context, msg) {
            if (this.level > 3) {
                if (msg instanceof Object) msg = JSON.stringify(msg, null, 4);
                this.proPrint([chalk.hex('#64B3FF')(`[${new Date(Date.now() + 288e5).toISOString()}]`), chalk.grey("[Debug]"), chalk.hex('#FFA500')(`[${context}]`), chalk.hex('#0070BB')(`[\n${msg}\n]`)])
            }
        },
        info(context, msg) {
            if (this.level > 2)
                this.proPrint([chalk.hex('#64B3FF')(`[${new Date(Date.now() + 288e5).toISOString()}]`), chalk.grey("[Info]"), chalk.hex('#FFA500')(`[${context}]`), chalk.hex('#48BB31')(`[${msg}]`)])
        },
        warn(context, msg) {
            if (this.level > 1)
                this.proPrint([chalk.hex('#64B3FF')(`[${new Date(Date.now() + 288e5).toISOString()}]`), chalk.grey("[Warn]"), chalk.hex('#FFA500')(`[${context}]`), chalk.hex('#BBBB23')(`[\n${msg}\n]`)])
        },
        error(context, msg) {
            if (this.level > 0)
                this.proPrint([chalk.hex('#64B3FF')(`[${new Date(Date.now() + 288e5).toISOString()}]`), chalk.grey("[Error]"), chalk.hex('#FFA500')(`[${context}]`), chalk.hex('#FF0006')(`[\n${msg}\n]`)])
        }
    },
    /**
     * 下载文件
     * @param {string} url
     * @param {string} file_name
     * @returns {Promise<void | string>}
     */
    download(url, file_name) {
        return new Promise((resolve, reject) => {
            send({
                url,
                stream: true,
                config: {
                    redirect: true,
                    retry: false
                },
                success: ({ resStream }) => {
                    let recv_length = 0;
                    const wtbs = fs.createWriteStream(file_name);
                    resStream.on('data', chuck => {
                        recv_length += chuck.length
                        utils.log.proPrint(`已收到:${recv_length} Bytes`)
                    })
                    resStream.pipe(wtbs)
                    wtbs.on('finish', () => {
                        utils.log.proPrint('下载完成')
                        resolve()
                    }).on('error', error => {
                        wtbs.destroy()
                        resolve(error)
                    })
                },
                failure: error => {
                    reject(error)
                }
            })
        });
    },
    /**
     * 获取远程设置
     * @returns {Promise<JSON>}
     */
    getRemoteConfig() {
        return new Promise((resolve) => {
            send({
                method: 'GET',
                url: 'https://gitee.com/shanmite/lottery-notice/raw/master/notice.json',
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                    accept: 'text/plain; charset=utf-8',
                    referer: 'https://gitee.com/shanmite/lottery-notice/blob/master/notice.json',
                },
                success: res => {
                    try {
                        const body = JSON.parse(res.body);
                        if (body.node_msg) utils.log.info('公告', '\n' + body.node_msg + '\n');
                        resolve(body.config)
                    } catch (error) {
                        resolve(JSON.parse('{}'))
                    }
                },
                failure: err => {
                    utils.log.error('获取远程设置', '获取远程设置错误: ' + err);
                    resolve(JSON.parse('{}'));
                }
            })
        })
    },
    /**
     * 是否存在文件或目录
     * @param {string} path
     * @returns 
     */
    hasFileOrDir(path) {
        try {
            fs.accessSync(path, fs.constants.F_OK)
        } catch (_) {
            return false
        }
        return true
    },
    /**
     * 生成文件夹
     * @param {string} dirname
     * @returns {Promise<void>}
     */
    createDir(dirname) {
        return new Promise((resolve) => {
            fs.stat(dirname, (err) => {
                if (err) {
                    fs.mkdirSync(dirname)
                }
                resolve()
            })
        });
    }
};


module.exports = utils;