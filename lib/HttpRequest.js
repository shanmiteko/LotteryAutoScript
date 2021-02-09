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
 * @typedef {object} RequestOptions Http请求选项
 * @property {string} method 请求方法
 * @property {string} url 完整链接
 * @property {object} [query] 查询选项
 * @property {object} [contents] 内容
 * @property {HttpHeaders} [headers] 请求头
 * @property {SuccessCb} [success] 成功回调
 * @property {FailureCb} [failure] 失败回调
 */
const { request: http_request } = require('http');
const { request: https_request } = require('https');
const { stringify } = require('querystring');
/**超时时间 */
const timeout = 20000;
/**超时尝试次数 */
let retry = 6;
/**
 * @description 简化HTTP请求
 * @param {RequestOptions} detail
 * @returns {void}
 */
const HttpRequest = detail => {
    const { method, url, query = {}, contents = {}, headers = {}, success, failure } = detail;
    const thisURL = new URL(url)
        , content = formatContents(headers, contents)
        , request = thisURL.protocol === 'http:' ? http_request : https_request;
    let options = {
        timeout,
        method,
        host: thisURL.host,
        path: thisURL.pathname,
        headers,
    };
    switch (method) {
        case 'GET':
            if (Object.keys(query).length !== 0) options.path += '?' + stringify(query);
            break;
        case 'POST':
            options.headers['content-length'] = Buffer.byteLength(content, 'utf-8').toString();
            break;
        default:
            return failure(`未实现的请求方法: ${method}`);
    }
    const req = request(options, res => resDataHandler(res, success, failure));
    if (method === 'POST') req.write(content);
    req.on('timeout', () => { req.destroy(new Error('请求超时')) })
        .on('error', err => {
            console.log(err.message);
            if (retry--) {
                console.log('[请求失败]尝试重新连接中...');
                HttpRequest(detail);
            } else {
                failure(`[请求失败]: ${err.message}`);
            }
        })
        .end();
}
/**
 * 处理请求体  
 * 默认url编码字符串
 * @private
 * @param {HttpHeaders} headers 请求的内容格式
 * @param {object} contents 请求体
 * @returns {string} 格式化字符串
 */
function formatContents(headers, contents) {
    const contentstype = headers['content-type'];
    if (typeof contentstype === 'undefined') return '';
    if (/application\/x-www-form-urlencoded/i.test(contentstype)) return stringify(contents);
    if (/application\/json/i.test(contentstype)) return JSON.stringify(contents);
    return '';
}
/**
 * @private
 * @param {import("http").IncomingMessage} res
 * @param {SuccessCb} success
 * @param {FailureCb} failure
 * @returns {void}
 */
function resDataHandler(res, success, failure) {
    let protodata = '';
    const { statusCode, headers } = res;
    res.setEncoding('utf8')
        .on('data', chunk => { protodata += chunk })
        .on('error', err => failure(`[响应错误] ${err.message}`));
    if (statusCode < 400) {
        res.on('end', () => success({ headers: headers, body: protodata }))
    } else {
        res.on('end', () => failure(`[响应错误]错误码:${statusCode} 响应数据:\n${protodata}`))
    }
}
module.exports = {
    HttpRequest
}