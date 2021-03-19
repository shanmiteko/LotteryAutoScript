//@ts-check
/**
 * @typedef {import("http").IncomingHttpHeaders} HttpHeaders 头部信息
 * 
 * @typedef {object} Respond 返回的响应
 * @property {HttpHeaders} headers 响应头
 * @property {string} [body] UTF8编码响应
 * @property {import("http").IncomingMessage} [resStream] 可读流式响应体
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
 * @typedef RequestConfig
 * @property {number} [timeout] 超时
 * @property {number} [wait] 错误等待
 * @property {boolean} [retry] 是否重传
 * @property {boolean} [redirect] 是否重定向
 * @property {number} [retry_times] 重试次数
 * 
 * @typedef {object} RequestOptions Http请求选项
 * @property {string} method 请求方法
 * @property {string} url 完整链接
 * @property {boolean} stream 是否流式数据
 * @property {RequestConfig} [config] 设置
 * @property {Proxy} [proxy] 代理
 * @property {Object.<string, string|number>} [query] 查询选项
 * @property {Object.<string, string|number> | string} [contents] 内容
 * @property {HttpHeaders} [headers] 请求头
 * @property {SuccessCb} success 成功回调
 * @property {FailureCb} failure 失败回调
 */

const { request: http_request } = require('http');
const { request: https_request } = require('https');
const { stringify } = require('querystring');

/**默认编码 */
const DEFAULT_DECODE = 'utf8';
/**超时时间 */
const DEFAULT_TIMEOUT = 20000;
/**出错等待时间 */
const DEFAULT_WAIT = 10000;
/**默认重传 */
const DEFAULT_RETRY = true;
/**默认不重定向 */
const DEFAULT_REDIRECT = false;
/**错误尝试次数 */
const DEFAULT_RETRY_TIMES = 6;
/**Google Chrome */
const DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';

/**
 * @description 简化HTTP请求
 * @param {RequestOptions} detail
 * @returns {void}
 */
function HttpRequest(detail) {
    detail = setDefault(detail);
    const { method, url, stream, config, proxy, query, contents, headers, success, failure } = detail;
    const { timeout, wait, retry, redirect, retry_times } = config;
    const thisURL = new URL(url)
        , content = formatContents(headers["content-type"], contents)
        , request = thisURL.protocol === 'https:' ? https_request : http_request;
    let options = {
        timeout,
        method: method.toUpperCase(),
        host: thisURL.host,
        path: thisURL.pathname + thisURL.search + thisURL.hash,
        headers,
    };
    if (!headers["user-agent"]) headers["user-agent"] = DEFAULT_UA;
    if (query) options.path += (thisURL.search ? '&' : '?') + stringify(query);
    if (content) options.headers['content-length'] = Buffer.byteLength(content, 'utf-8').toString();
    if (proxy) {
        options.headers.host = thisURL.host;
        [options.hostname, options.port] = proxy.host ?
            proxy.host.split(':') : [proxy.hostname, proxy.port]
        options.path = thisURL.href;
    }
    const req = request(options, res => {
        let protodata = '';
        const { statusCode, headers } = res;
        if (redirect && ~~(statusCode / 100) === 3) {
            try {
                detail.url = new URL(headers.location).href
            } catch (error) {
                detail.url = new URL(thisURL.origin + headers.location).href
            }
            console.log(`[重定向]状态码:${statusCode} location:${detail.url}`);
            HttpRequest(detail)
            return
        }
        if (stream) {
            success({ headers: headers, resStream: res })
        } else {
            res.setEncoding(DEFAULT_DECODE)
                .on('data', chunk => { protodata += chunk })
                .on('error', async err => {
                    if (retry && retry_times) {
                        console.log(`[不期待响应]原因:${err.message} 尝试重新请求中...`);
                        await delay(wait);
                        detail.config.retry_times = retry_times - 1;
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
        }
    })
    req.on('error', async err => {
        if (retry && retry_times) {
            console.log(`[请求失败]原因:${err.message} 尝试重新连接中...`);
            await delay(wait);
            detail.config.retry_times = retry_times - 1;
            HttpRequest(detail);
        } else {
            failure(`[请求失败]: ${err.message}`);
        }
    })
    req.on('timeout', () => { req.destroy(new Error('请求超时')) })
    req.end(content)
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
    if (/text\/plain/i.test(type)) return contents;
    if (contents) return stringify(contents)
    return contents;
}

/**
 * 设置默认
 * @param {RequestOptions} detail 
 */
function setDefault(detail) {
    detail = {
        stream: false,
        headers: {},
        ...detail
    }
    detail.config = {
        timeout: DEFAULT_TIMEOUT,
        wait: DEFAULT_WAIT,
        retry: DEFAULT_RETRY,
        redirect: DEFAULT_REDIRECT,
        retry_times: DEFAULT_RETRY_TIMES,
        ...detail.config
    }
    return detail;
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


module.exports = { HttpRequest }