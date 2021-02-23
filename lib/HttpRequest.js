//@ts-check
/**
 * @typedef {import("http").IncomingHttpHeaders} HttpHeaders 头部信息
 * 
 * @typedef {object} Respond 返回的响应
 * @property {HttpHeaders} headers 响应头
 * @property {string} body 响应体
 * 
 * @callback SuccessCb 成功回调
 * @param {Respond} res
 * @returns {void}
 * @callback FailureCb 失败回调
 * @param {string} err
 * @returns {void}
 * 
 * @typedef Proxy
 * @property {string} hostname
 * @property {string} [host]
 * @property {number} port
 * 
 * @typedef {object} RequestOptions Http请求选项
 * @property {string} method 请求方法
 * @property {string} url 完整链接
 * @property {Proxy} proxy 代理
 * @property {Object.<string, string|number>} [query] 查询选项
 * @property {Object.<string, string|number>} [contents] 内容
 * @property {HttpHeaders} [headers] 请求头
 * @property {SuccessCb} [success] 成功回调
 * @property {FailureCb} [failure] 失败回调
 */
const { request: http_request } = require('http');
const { request: https_request } = require('https');
const { stringify } = require('querystring');
/**超时时间 */
const TIMEOUT = 5000;
/**出错等待时间 */
const WAIT = 10000;
/**错误尝试次数 */
let retry = 6;
/**Google Chrome */
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';
/**
 * @description 简化HTTP请求
 * @param {RequestOptions} detail
 * @returns {void}
 */
const HttpRequest = detail => {
    const { method, url, proxy, query, contents, headers = {}, success, failure } = detail;
    const thisURL = new URL(url)
        , content = formatContents(headers["content-type"], contents)
        , request = thisURL.protocol === 'https:' ? https_request : http_request;
    let options = {
        timeout: TIMEOUT,
        method: method.toUpperCase(),
        host: thisURL.host,
        path: thisURL.pathname + thisURL.hash,
        headers,
    };
    if (!headers["user-agent"]) headers["user-agent"] = UA;
    if (query) options.path += '?' + stringify(query);
    if (contents) options.headers['content-length'] = Buffer.byteLength(content, 'utf-8').toString();
    if (proxy) {
        options.headers.host = thisURL.host;
        [options.hostname, options.port] = proxy.host ?
            proxy.host.split(':') : [proxy.hostname, proxy.port]
        options.path = thisURL.href;
    }
    const req = request(options, res => {
        let protodata = '';
        const { statusCode, headers } = res;
        res.setEncoding('utf8')
            .on('data', chunk => { protodata += chunk })
            .on('error', async err => {
                console.log(err.message);
                if (retry--) {
                    console.log('[不期待响应]尝试重新请求中...');
                    await delay(WAIT);
                    HttpRequest(detail);
                } else {
                    failure(`[响应错误]${err.message} 响应数据:\n${protodata}`)
                }
            })
            .on('end', () => {
                if (statusCode < 400) {
                    success({ headers: headers, body: protodata })
                } else {
                    res.emit('error', new Error(`HTTP状态码: ${statusCode}`))
                }
            })
    });
    req.on('timeout', () => { req.destroy(new Error('请求超时')) })
        .on('error', async err => {
            console.log(err.message);
            if (retry--) {
                console.log('[请求失败]尝试重新连接中...');
                await delay(WAIT);
                HttpRequest(detail);
            } else {
                failure(`[请求失败]: ${err.message}`);
            }
        })
        .end(content);
}
/**
 * 处理请求体  
 * 默认url编码字符串
 * @private
 * @param {string} type 请求的内容格式
 * @param {object} contents 请求体
 * @returns {string} 格式化字符串
 */
function formatContents(type, contents) {
    if (/application\/json/i.test(type)) return JSON.stringify(contents);
    if (contents) return stringify(contents)
    return contents;
}
/**
 * 延时函数
 * @param {number} time ms
 * @returns {Promise<void>}
 */
function delay(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
module.exports = {
    HttpRequest
}