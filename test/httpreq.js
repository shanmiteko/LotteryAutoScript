const { HttpRequest } = require("../lib/HttpRequest");

HttpRequest({
    method: 'GET',
    url: 'https://www.www.www',
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
        accept: 'application/json, text/plain, */*',
    },
    config: {
        wait: 1000
    },
    success: res => {
        console.log(res.body);
    },
    failure: err => {
        console.log(err);
    }
})
