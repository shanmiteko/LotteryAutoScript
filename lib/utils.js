const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { send } = require('./net/http');
const { version } = require('../package.json');

/**
 * 基础工具
 */
const utils = {
    version,
    /**环境变量设置文件 */
    env_file: path.join(process.cwd(), 'env.js'),
    /**配置文件 */
    config_file: path.join(process.cwd(), 'my_config.js'),
    /**dyids存放目录 */
    dyids_dir: path.join(process.cwd(), 'dyids'),
    /**lottery_info存放目录 */
    lottery_info_dir: path.join(process.cwd(), 'lottery_info'),
    /**本地抽奖信息存放目录 */
    lottery_dyids: path.join(process.cwd(), 'lottery_dyids'),
    /**
     * 将版本号转为数字
     * @example
     * 1.2.3 => 1.0203
     * @param {string} version
     * @returns {Number}
     */
    checkVersion(version) {
        return (version.match(/\d.*/)[0]).split('.').reduce((a, v, i) => a + (0.01 ** i) * Number(v), 0);
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
                    return typeof obj === 'object' ? obj : false;
                } catch (e) {
                    utils.log.error('json解析', e + '\n' + params);
                    return false;
                }
            } else {
                return false;
            }
        })(params);
        return isJSON ? isJSON : {};
    },
    /**
     * @template T
     * @param {Array<T>} iter
     * @param {(value: T) => Promise<Boolean>} fn 返回true整体退出
     */
    async try_for_each(iter, fn) {
        for (const item of iter) {
            if (await fn(item)) break;
        }
    },
    /**
     * @template T
     * @param {number} max_times
     * @param {Array<T>} unexpected
     * @param {() => Promise<T>} fn
     * @return {Promise<T | null>}
     */
    async retryfn(max_times, unexpected, fn) {
        let ret = null;
        for (let times = 0; times < max_times; times++) {
            ret = await fn();
            if (unexpected.includes(ret)) {
                utils.log.warn('自动重试', `将在 ${times + 1} 分钟后再次尝试(${times + 1}/${max_times})`);
                await utils.delay(60 * 1000 * (times + 1));
            } else {
                break;
            }
        }
        return ret;
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
        return new Promise(resolve => setTimeout(resolve, time));
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
            clear: () => {
                c.i = 0;
            },
            value: () => c.i
        };
        return c;
    },
    /**
     * 无限序列
     * `[0..]`
     */
    * infiniteNumber() {
        for (let index = 0; ; index++) {
            yield index;
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
        return RandomOne;
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
                : RegExp(word).test(text) && (acc = true);
            return acc;
        }, false);
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
        _level: 3,
        _colors: [
            chalk.hex('#64B3FF'), chalk.grey, chalk.hex('#FFA500'),
            chalk.hex('#0070BB'), chalk.hex('#48BB31'), chalk.hex('#BFFF00'), chalk.hex('#BBBB23'), chalk.hex('#FF0006')
        ],
        _iso_time: () => new Date(Date.now() + 288e5).toISOString().slice(0, -1) + '+08',
        _cache: [],
        /**
         * 初始化默认level为3
         */
        init() {
            let _level = Number(process.env.LOTTERY_LOG_LEVEL);
            this._level = isNaN(_level) ? 3 : _level;
        },
        /**
         * @param {String|Array<String>} msg
         * @param {String} [split] 分隔符
         */
        proPrint(msg, split = ' ') {
            if (msg instanceof Array) {
                msg = msg.join(split);
            }
            console.log(msg);
        },
        /**
         * @param {Array<string>} msg
         * @returns
         */
        rainbow(msg) {
            this.proPrint(msg.map(it => it.split('').map(l => chalk.hex('#89cff0')(l)).join('')), '\n');
        },
        /**
         * @param {number} done
         * @param {number} total
         * @param {number} size
         */
        progress_bar(done, total, size = 30) {
            let perc = done >= total ? 1 : done / total,
                bar = ~~(perc * size),
                status_bar = `\r[${'='.repeat(bar) + '>' + ' '.repeat(size - bar)}] ${(perc * 100 + '    ').slice(0, 4)}%`;
            process.stdout.write(status_bar);
        },
        debug(context, msg) {
            if (this._level >= 4) {
                if (msg instanceof Object) msg = JSON.stringify(msg, null, 4);
                let color_text_pair = [
                    [this._colors[0], `[${this._iso_time()}]`],
                    [this._colors[1], '[Debug]'],
                    [this._colors[2], `[帐号${process.env['NUMBER']} ${context}]`],
                    [this._colors[3], `[\n${msg}\n]`],
                ];
                this.proPrint(color_text_pair.map(([color, text]) => color(text)));
            }
        },
        info(context, msg) {
            if (this._level >= 3) {
                let color_text_pair = [
                    [this._colors[0], `[${this._iso_time()}]`],
                    [this._colors[1], '[Info]'],
                    [this._colors[2], `[帐号${process.env['NUMBER']} ${context}]`],
                    [this._colors[4], `[${msg}]`],
                ];
                this._cache.push(color_text_pair.map(it => it[1]).join(' '));
                this.proPrint(color_text_pair.map(([color, text]) => color(text)));
            }
        },
        notice(context, msg) {
            if (this._level >= 2) {
                let color_text_pair = [
                    [this._colors[0], `[${this._iso_time()}]`],
                    [this._colors[1], '[Notice]'],
                    [this._colors[2], `[帐号${process.env['NUMBER']} ${context}]`],
                    [this._colors[5], `[${msg}]`],
                ];
                this._cache.push(color_text_pair.map(it => it[1]).join(' '));
                this.proPrint(color_text_pair.map(([color, text]) => color(text)));
            }
        },
        warn(context, msg) {
            if (this._level >= 1) {
                let color_text_pair = [
                    [this._colors[0], `[${this._iso_time()}]`],
                    [this._colors[1], '[Warn]'],
                    [this._colors[2], `[帐号${process.env['NUMBER']} ${context}]`],
                    [this._colors[6], `[\n${msg}\n]`],
                ];
                this._cache.push(color_text_pair.map(it => it[1]).join(' '));
                this.proPrint(color_text_pair.map(([color, text]) => color(text)));
            }
        },
        error(context, msg) {
            if (this._level >= 0) {
                let color_text_pair = [
                    [this._colors[0], `[${this._iso_time()}]`],
                    [this._colors[1], '[Error]'],
                    [this._colors[2], `[帐号${process.env['NUMBER']} ${context}]`],
                    [this._colors[7], `[\n${msg}\n]`],
                ];
                this._cache.push(color_text_pair.map(it => it[1]).join(' '));
                this.proPrint(color_text_pair.map(([color, text]) => color(text)));
            }
        }
    },
    /**
     * 验证码识别
     * @param {string} url
     * @returns {Promise<string>}
     */
    ocr(url) {
        return new Promise((resolve) => {
            send({
                method: 'POST',
                url: process.env['CHAT_CAPTCHA_OCR_URL'] || 'http://127.0.0.1:9898/ocr/url/text',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                contents: { url },
                success: res => {
                    resolve(res.body);
                },
                failure: () => {
                    resolve(null);
                }
            });
        });
    },
    /**
     * 下载文件
     * @param {string} url
     * @param {string} file_name
     * @param {number} size
     * @returns {Promise<void | string>}
     */
    download(url, file_name, size) {
        return new Promise((resolve, reject) => {
            send({
                url,
                stream: true,
                config: {
                    redirect: true,
                    retry: false
                },
                success: ({ headers, resStream }) => {
                    const total_len = Number(headers['content-length']) || 16000000;
                    let recv_length = 0;
                    const wtbs = fs.createWriteStream(file_name);
                    resStream.on('data', chuck => {
                        recv_length += chuck.length;
                        utils.log.progress_bar(recv_length, total_len);
                    });
                    resStream.pipe(wtbs);
                    wtbs.on('finish', () => {
                        utils.log.proPrint('下载完成');
                        if (recv_length < size) {
                            reject(`未正确下载文件: ${recv_length}B < ${size}B`);
                        }
                        resolve();
                    }).on('error', error => {
                        wtbs.destroy();
                        reject(error);
                    });
                },
                failure: error => {
                    reject(error);
                }
            });
        });
    },
    /**
     * 是否存在文件或目录
     * @param {string} path
     * @returns
     */
    hasFileOrDir(path) {
        try {
            fs.accessSync(path, fs.constants.F_OK);
        } catch (_) {
            return false;
        }
        return true;
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
                    fs.mkdirSync(dirname);
                }
                resolve();
            });
        });
    },
    /**
     * CreateFile
     * @param {string} basename
     * @param {string} filename
     * @param {string} [defaultValue] 写入默认值
     * @param {string} flag
     * @returns {Promise<void>}
     */
    createFile(basename, filename, defaultValue, flag) {
        const fpath = path.join(basename, filename);
        const buffer = Buffer.from(defaultValue);
        return new Promise((resolve, rejects) => {
            fs.open(fpath, flag, (err, fd) => {
                if (err) {
                    rejects(err);
                } else {
                    fs.write(fd, buffer, 0, buffer.length, 0, err => {
                        fs.close(fd);
                        if (err) {
                            rejects(err);
                        } else {
                            resolve();
                        }
                    });
                }
            });
        });
    },
    /**
     * 读取dyid文件
     * @param {number} num
     * @returns {fs.ReadStream}
     */
    readDyidFile(num) {
        const fpath = num < 2 ? path.join(utils.dyids_dir, 'dyid.txt') : path.join(utils.dyids_dir, `dyid${num}.txt`);
        return fs.createReadStream(fpath, { encoding: 'utf8' });
    },
    /**
     * 追加dyid
     * @param {number} num
     * @returns {fs.WriteStream}
     */
    writeDyidFile(num) {
        const fpath = num < 2 ? path.join(utils.dyids_dir, 'dyid.txt') : path.join(utils.dyids_dir, `dyid${num}.txt`);
        return fs.createWriteStream(fpath, { flags: 'a' });
    },
    /**
     * 追加lotteryinfo
     * @param {string} from
     * @param {import('./core/searcher').LotteryInfo[]} lottery_info
     * @return {Promise<void>}
     */
    async appendLotteryInfoFile(from, lottery_info) {
        let all_lottery_info = {};
        try {
            all_lottery_info = utils.strToJson(fs.readFileSync(path.join(utils.lottery_info_dir, `lottery_info_${Number(process.env.NUMBER)}.json`)).toString());
        } catch (_) {
            all_lottery_info = {};
        }
        await utils.createDir(utils.lottery_info_dir);
        if (all_lottery_info[from] instanceof Array) {
            all_lottery_info[from].push(...lottery_info);
        } else {
            all_lottery_info[from] = lottery_info;
        }
        await utils.createFile(utils.lottery_info_dir, `lottery_info_${Number(process.env.NUMBER)}.json`, JSON.stringify(all_lottery_info), 'w');
    },
    /**
     * 读取lottery_info
     * @param {string} filename
     * @return {Promise<import('./core/searcher').LotteryInfo[]>}
     */
    readLotteryInfoFile(filename) {
        return new Promise((resolve) => {
            fs.readFile(path.join(utils.lottery_info_dir, filename), (err, data) => {
                if (err) {
                    resolve([]);
                } else {
                    let all_lottery_info = utils.strToJson(data.toString('utf8'));
                    resolve(Object.values(all_lottery_info).flat());
                }
            });
        });
    },
    /**
     * 清空lottery_info file
     */
    async clearLotteryInfo() {
        await utils.createDir(utils.lottery_info_dir);
        await utils.createFile(utils.lottery_info_dir, `lottery_info_${Number(process.env.NUMBER)}.json`, '{}', 'w');
    },
    /**
     * 获取含抽奖dyids
     * @param {string} filename
     * @returns {Promise<Array<String>>}
     */
    getLocalLotteryTxt(filename) {
        return new Promise((resolve) => {
            fs.readFile(path.join(utils.lottery_dyids, filename), (err, data) => {
                if (err) {
                    resolve([]);
                } else {
                    resolve(data.toString('utf8').split(/[^0123456789]+/));
                }
            });
        });
    },
    getIpInfo() {
        return new Promise((resolve) => {
            send({
                url: 'https://myip.qq.com/',
                method: 'GET',
                success: res => resolve(res.body),
                failure: err => resolve(err)
            });
        });
    },
    printIpInfo(beforeProxy) {
        const printMessage = beforeProxy ? '当前IP----->' : '代理后IP=======>';
        utils.getIpInfo().then(res => {
            console.log(printMessage + res);
        }).catch((err) => {
            console.error('获取' + printMessage + '地址失败', err);
        });
    }
};


module.exports = utils;