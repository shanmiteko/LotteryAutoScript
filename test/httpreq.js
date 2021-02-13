const { HttpRequest } = require("../lib/HttpRequest");

HttpRequest({
    method: 'GET',
    url: 'https://api.bilibili.com/x/article/creative/draft/view',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
    },
    success: res => {
        console.log(res.body);
    },
    error: err => {
        console.log(err);
    }
})