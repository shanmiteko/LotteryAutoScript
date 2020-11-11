import { request } from 'http';
import { stringify } from 'querystring';
/**
 * 简化nodejs发送http请求的步骤
 * @param {object} obj
 * @member type
 * 请求的方法
 * @member _url
 * 请求的完整链接(若有查询字符串则为'?'之前的内容)
 * @member _query_string
 * 键值对形式的查询字符串(值为对象)
 * @member contents
 * 键值对形式的请求体(值为对象)
 * @member headers
 * 键值对形式的请求头(值为对象)
 * @member success
 * 请求成功执行的方法
 * @member error
 * 请求失败执行的方法
 */
export const HttpRequest = obj => {
    const type = obj.type;
    const _url = obj._url;
    const headers = obj.headers;
    const _query_string = obj._query_string;
    const contents = formatContents(headers['Content-Type'],obj.contents);
    (()=>{
        const reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+).)+([A-Za-z0-9-~/])+$/;
        if (!reg.test(_url)) {
            console.log('url无效');
            return;
        }
    })()
    /**
     * 处理options
     */
    let options = {
        host: /(?<=https?:\/\/)[a-zA-Z.]*(?=\/)/.exec(_url)[0],
        path: /(?<=https?:\/\/.*)\/.*/.exec(_url)[0],
        headers: headers,
    };
    let query_string = '';
    switch (type) {
        case 'get':
        case 'GET':
            options.method = 'GET';
            if (typeof _query_string != 'undefined') {
                query_string = stringify(_query_string);
            }
            if (query_string != '') {
                let url = _url + '?' + query_string;
                options.path = /(?<=https?:\/\/.*)\/.*/.exec(url)[0];
            }
            break;
        case 'post':
        case 'POST':
            options.method = 'POST';
            options.headers['Content-Length'] = contents.length;
            if (typeof headers['Content-Type'] =='undefined') {
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
            }
            break;
        default:
            console.log('请检查传入HttpRequest方法的对象中的type属性');
            break;
    }
    /**
     * 发送Http请求
     */
    let req = request(options, res => {
        let protodata = '';
        if (res.statusCode == 200) {
            // console.log('真·服务器返回的响应头');
            // console.log(res.headers);
            res.setEncoding('utf8');
            res.on('data', chunk => {
                protodata += chunk
            })
            res.on('end', () => {
                obj.success(protodata)
            })
        } else {
            console.log(`${res.statusCode} RESPEND ERROR!`);
            obj.error(`服务器拒绝了你的请求`);
        }
    });
    if (type == 'POST') {
        req.write(contents)
    }
    req.on('error', () => {
        console.error("REQUEST ERROR!")
        obj.error(`请求失败\n${_url}是无效的url`);
    });
    req.end()
}
/**
 * 处理请求体
 * 默认url编码字符串
 * @param {string} contentstype 请求的内容格式
 * @param {object} contents 请求体
 * @returns 格式化字符串
 */
function formatContents(contentstype,contents) {
    if (typeof contents == 'undefined') {
        return ''
    }
    if (/application\/x-www-form-urlencoded/i.test(contentstype)) {
        return stringify(contents)
    }
    if (/application\/json/i.test(contentstype)) {
        return JSON.stringify(contents)
    }
    return stringify(contents);
}