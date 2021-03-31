const { HttpRequest } = require('./HttpRequest');
const GlobalVar = require("./GlobalVar.json");

/**
 * Ajax请求对象
 */
module.exports = (() => {
    const get = ({ url, retry, queryStringsObj, success }) => {
        HttpRequest({
            method: 'GET',
            url,
            config: {
                retry
            },
            query: queryStringsObj,
            headers: {
                "accept": 'application/json, text/plain, */*',
                "cookie": GlobalVar.cookie
            },
            success: res => success(res.body),
            failure: err => success(err)
        })
    };
    const post = ({ url, retry, data, success }) => {
        HttpRequest({
            method: 'POST',
            url,
            contents: data,
            config: {
                retry
            },
            headers: {
                "accept": 'application/json, text/plain, */*',
                "content-type": 'application/x-www-form-urlencoded; charset=utf-8',
                "cookie": GlobalVar.cookie
            },
            success: res => success(res.body),
            failure: err => success(err)
        })
    };
    return { get, post };
})();
