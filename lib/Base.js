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
};
