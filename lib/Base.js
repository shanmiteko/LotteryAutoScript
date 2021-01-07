/**
 * 基础工具
 */
module.exports = {
    /**
     * 安全的将JSON字符串转为对象
     * 超出精度的数转为字符串
     * @param {string} params
     * @return {object}
     * 返回对象
     */
    strToJson: params => {
        let isJSON = str => {
            if (typeof str === 'string') {
                try {
                    var obj = JSON.parse(str);
                    if (typeof obj === 'object' && obj) {
                        return true;
                    } else {
                        return false;
                    }
                } catch (e) {
                    console.error('error：' + str + '!!!' + e);
                    return false;
                }
            }
            console.error('It is not a string!');
        };
        if (isJSON(params)) {
            let obj = JSON.parse(params);
            return obj;
        } else {
            return {};
        }
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
     * 随机获取字符串数组中的字符串
     * @param {string[]} arr
     * @returns {string}
     */
    getRandomStr: arr => {
        return arr[parseInt(Math.random() * arr.length)];
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
     * 
     * @param {string} ts 13位时间戳
     * @param {number} zoneOffset 东时区记做正数
     */
    transformTimeZone: (ts, zoneOffset) => new Date(new Date(ts).getTime() + zoneOffset * 60 * 60 * 1000)
};
