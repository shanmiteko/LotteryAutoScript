const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { HttpRequest } = require("./HttpRequest");

/**
 * 基础工具
 */
const Util = {
    /**环境变量设置文件 */
    env_file: path.join(process.cwd(), "env.js"),
    /**配置文件 */
    config_file: path.join(process.cwd(), "my_config.js"),
    /**dyid存储文件 */
    dyids_dir: path.join(process.cwd(), "dyids"),
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
     * @param {number} time ms
     * @returns {Promise<void>}
     */
    delay(time) {
        Util.log.info('时延', `${~~time}ms`);
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
    hasEnv(env_name) {
        return process.env[env_name] ? true : false;
    },
    /**日志 */
    log: {
        level: 0,
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
            console.log([msg].flat().join(split))
        },
        debug(context, msg) {
            if (this.level > 3) {
                if (msg instanceof Object) msg = JSON.stringify(msg, null, 4);
                this.proPrint([chalk.hex('#64B3FF')(`[${Date()}]`), chalk.grey("[Debug]"), chalk.hex('#FFA500')(`[${context}]`), chalk.hex('#0070BB')(`[\n${msg}\n]`)])
            }
        },
        info(context, msg) {
            if (this.level > 2)
                this.proPrint([chalk.hex('#64B3FF')(`[${Date()}]`), chalk.grey("[Info]"), chalk.hex('#FFA500')(`[${context}]`), chalk.hex('#48BB31')(`[${msg}]`)])
        },
        warn(context, msg) {
            if (this.level > 1)
                this.proPrint([chalk.hex('#64B3FF')(`[${Date()}]`), chalk.grey("[Warn]"), chalk.hex('#FFA500')(`[${context}]`), chalk.hex('#BBBB23')(`[${msg}]`)])
        },
        error(context, msg) {
            if (this.level > 0)
                this.proPrint([chalk.hex('#64B3FF')(`[${Date()}]`), chalk.grey("[Error]"), chalk.hex('#FFA500')(`[${context}]`), chalk.hex('#FF0006')(`[${msg}]`)])
        }
    },
    /**
     * 获取远程设置
     * @returns {Promise<JSON>}
     */
    getRemoteConfig() {
        return new Promise((resolve) => {
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
                        const body = JSON.parse(res.body);
                        if (body.node_msg) this.log.info('公告', '\n' + body.node_msg + '\n');
                        resolve(body.config)
                    } catch (error) {
                        resolve(JSON.parse('{}'))
                    }
                },
                failure: err => {
                    this.log.error('获取远程设置', '获取远程设置错误: ' + err);
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
    },
    /**
     * CreateFile
     * @param {string} filepath 相对于dyids的文件路径
     * @param {string} [defaultValue] 写入默认值
     * @param {string} flag
     * @returns {Promise<void>}
     */
    createFile(filepath, defaultValue, flag) {
        const fpath = path.join(this.dyids_dir, filepath);
        const buffer = Buffer.from(defaultValue);
        return new Promise((resolve, rejects) => {
            fs.open(fpath, flag, (err, fd) => {
                if (err) {
                    rejects(err)
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
     * dyid长度
     */
    dyid_length: 18,
    /**
     * 读取dyid文件
     * @param {number} num
     * @returns {fs.ReadStream}
     */
    readDyidFile(num) {
        const fpath = num < 2 ? path.join(this.dyids_dir, 'dyid.txt') : path.join(this.dyids_dir, `dyid${num}.txt`);
        return fs.createReadStream(fpath, { encoding: 'utf8', highWaterMark: (this.dyid_length + 1) * 1000 })
    },
    /**
     * 追加dyid
     * @param {number} num
     * @returns {fs.WriteStream}
     */
    writeDyidFile(num) {
        const fpath = num < 2 ? path.join(this.dyids_dir, 'dyid.txt') : path.join(this.dyids_dir, `dyid${num}.txt`);
        return fs.createWriteStream(fpath, { flags: 'a' })
    }
};


module.exports = Util;