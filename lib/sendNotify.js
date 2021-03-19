const { HttpRequest } = require("./HttpRequest");

// =======================================微信server酱通知设置区域===========================================
//此处填你申请的SCKEY.
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入SCKEY)
let SCKEY = '';
//Turbo
let SENDKEY = '';

// =======================================QQ酷推通知设置区域===========================================
//此处填你申请的SKEY(具体详见文档 https://cp.xuthus.cc/)
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入QQ_SKEY)
let QQ_SKEY = '';
//此处填写私聊或群组推送，默认私聊(send[私聊]、group[群聊]、wx[个微]、ww[企微])
let QQ_MODE = 'send';

// =======================================Bark App通知设置区域===========================================
//此处填你BarkAPP的信息(IP/设备码，例如：https://api.day.app/XXXXXXXX)
//注：此处设置github action用户填写到Settings-Secrets里面（Name输入BARK_PUSH）
let BARK_PUSH = '';
//BARK app推送铃声,铃声列表去APP查看复制填写
//注：此处设置github action用户填写到Settings-Secrets里面（Name输入BARK_SOUND , Value输入app提供的铃声名称，例如:birdsong）
let BARK_SOUND = '';


// =======================================telegram机器人通知设置区域===========================================
//此处填你telegram bot 的Token，例如：1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入TG_BOT_TOKEN)
let TG_BOT_TOKEN = '';
//此处填你接收通知消息的telegram用户的id，例如：129xxx206
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入TG_USER_ID)
let TG_USER_ID = '';
//代理主机
let TG_PROXY_HOST = '';
//代理端口
let TG_PROXY_PORT = '';
// =======================================钉钉机器人通知设置区域===========================================
//此处填你钉钉 bot 的webhook，例如：5a544165465465645d0f31dca676e7bd07415asdasd
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入DD_BOT_TOKEN)
let DD_BOT_TOKEN = '';
//密钥，机器人安全设置页面，加签一栏下面显示的SEC开头的字符串
let DD_BOT_SECRET = '';

// =======================================企业微信机器人通知设置区域===========================================
//此处填你企业微信机器人的 webhook(详见文档 https://work.weixin.qq.com/api/doc/90000/90136/91770)，例如：693a91f6-7xxx-4bc4-97a0-0ec2sifa5aaa
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入QYWX_KEY)
let QYWX_KEY = '';

// =======================================iGot聚合推送通知设置区域===========================================
//此处填您iGot的信息(推送key，例如：https://push.hellyw.com/XXXXXXXX)
//注：此处设置github action用户填写到Settings-Secrets里面（Name输入IGOT_PUSH_KEY）
let IGOT_PUSH_KEY = '';

// =======================================push+设置区域=======================================
//官方文档：https://pushplus.hxtrip.com/
//PUSH_PLUS_TOKEN：微信扫码登录后一对一推送或一对多推送下面的token(您的Token)，不提供PUSH_PLUS_USER则默认为一对一推送
//PUSH_PLUS_USER： 一对多推送的“群组编码”（一对多推送下面->您的群组(如无则新建)->群组编码，如果您是创建群组人。也需点击“查看二维码”扫描绑定，否则不能接受群组消息推送）
let PUSH_PLUS_TOKEN = '';
let PUSH_PLUS_USER = '';

//==========================云端环境变量的判断与接收=========================
if (process.env.SCKEY) {
    SCKEY = process.env.SCKEY;
}

if (process.env.SENDKEY) {
    SENDKEY = process.env.SENDKEY;
}

if (process.env.QQ_SKEY) {
    QQ_SKEY = process.env.QQ_SKEY;
}

if (process.env.QQ_MODE) {
    QQ_MODE = process.env.QQ_MODE;
}


if (process.env.BARK_PUSH) {
    if (process.env.BARK_PUSH.indexOf('https') > -1 || process.env.BARK_PUSH.indexOf('http') > -1) {
        //兼容BARK自建用户
        BARK_PUSH = process.env.BARK_PUSH
    } else {
        BARK_PUSH = `https://api.day.app/${process.env.BARK_PUSH}`
    }
    if (process.env.BARK_SOUND) {
        BARK_SOUND = process.env.BARK_SOUND
    }
} else {
    if (BARK_PUSH && BARK_PUSH.indexOf('https') === -1 && BARK_PUSH.indexOf('http') === -1) {
        //兼容BARK本地用户只填写设备码的情况
        BARK_PUSH = `https://api.day.app/${BARK_PUSH}`
    }
}
if (process.env.TG_BOT_TOKEN) {
    TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
}
if (process.env.TG_USER_ID) {
    TG_USER_ID = process.env.TG_USER_ID;
}
if (process.env.TG_PROXY_HOST) {
    TG_PROXY_HOST = process.env.TG_PROXY_HOST;
}
if (process.env.TG_PROXY_PORT) {
    TG_PROXY_PORT = process.env.TG_PROXY_PORT;
}

if (process.env.DD_BOT_TOKEN) {
    DD_BOT_TOKEN = process.env.DD_BOT_TOKEN;
    if (process.env.DD_BOT_SECRET) {
        DD_BOT_SECRET = process.env.DD_BOT_SECRET;
    }
}

if (process.env.QYWX_KEY) {
    QYWX_KEY = process.env.QYWX_KEY;
}

if (process.env.IGOT_PUSH_KEY) {
    IGOT_PUSH_KEY = process.env.IGOT_PUSH_KEY
}

if (process.env.PUSH_PLUS_TOKEN) {
    PUSH_PLUS_TOKEN = process.env.PUSH_PLUS_TOKEN;
}
if (process.env.PUSH_PLUS_USER) {
    PUSH_PLUS_USER = process.env.PUSH_PLUS_USER;
}
//==========================云端环境变量的判断与接收=========================


async function sendNotify(text, desp, params = {}) {
    //提供9种通知方式
    await Promise.all([
        //微信server酱
        serverNotify(text, desp),
        //微信server酱Turbo版
        serverNotifyTurbo(text, desp),
        //pushplus(推送加)
        pushPlusNotify(text, desp),
        //iOS Bark APP
        barkNotify(text, desp, params),
        //telegram 机器人
        tgBotNotify(text, desp),
        //钉钉机器人
        ddBotNotify(text, desp),
        //企业微信机器人
        qywxBotNotify(text, desp),
        //iGot
        iGotNotify(text, desp, params),
        //QQ酷推
        coolPush(text, desp)
    ])
}

function serverNotify(text, desp) {
    return new Promise(resolve => {
        if (SCKEY) {
            HttpRequest({
                method: 'GET',
                url: `https://sc.ftqq.com/${SCKEY}.send`,
                query: {
                    text,
                    desp
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.errno === 0) {
                            console.log('server酱发送通知消息成功\n')
                        } else if (data.errno === 1024) {
                            // 一分钟内发送相同的内容会触发
                            console.log(`server酱发送通知消息异常: ${data.errmsg}\n`)
                        } else {
                            console.log(`server酱发送通知消息异常\n${JSON.stringify(data)}`)
                        }
                    } catch (error) {
                        console.log(error);
                    } finally {
                        resolve()
                    }
                },
                failure: err => {
                    console.log('发送通知调用API失败！！\n')
                    throw new Error(err);
                }
            })
        } else {
            console.log('您未提供server酱的SCKEY，取消微信推送消息通知\n');
            resolve()
        }
    })
}

function serverNotifyTurbo(text, desp) {
    return new Promise(resolve => {
        if (SENDKEY) {
            HttpRequest({
                method: 'POST',
                url: `https://sctapi.ftqq.com/${SENDKEY}.send`,
                contents: {
                    text,
                    desp
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.errno === 0) {
                            console.log('server酱(Turbo版)发送通知消息成功\n')
                        } else if (data.errno === 1024) {
                            // 一分钟内发送相同的内容会触发
                            console.log(`server酱(Turbo版)发送通知消息异常: ${data.errmsg}\n`)
                        } else {
                            console.log(`server酱(Turbo版)发送通知消息异常\n${JSON.stringify(data)}`)
                        }
                    } catch (error) {
                        console.log(error);
                    } finally {
                        resolve()
                    }
                },
                failure: err => {
                    console.log('发送通知调用API失败！！\n')
                    throw new Error(err);
                }
            })
        } else {
            console.log('您未提供server酱(Turbo版)的SCKEY，取消微信推送消息通知\n');
            resolve()
        }
    })
}

function coolPush(text, desp) {
    return new Promise(resolve => {
        if (QQ_SKEY) {
            let pushMode = function (t) {
                switch (t) {
                    case "send":
                        return "个人";
                    case "group":
                        return "QQ群";
                    case "wx":
                        return "微信";
                    case "ww":
                        return "企业微信";
                    default:
                        return "未知方式"
                }
            }
            HttpRequest({
                method: 'POST',
                url: `https://push.xuthus.cc/${QQ_MODE}/${QQ_SKEY}`,
                contents: `${text}\n${desp}`,
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    "content-type": "text/plain",
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.code === 200) {
                            console.log(`酷推发送${pushMode(QQ_MODE)}通知消息成功\n`)
                        } else if (data.code === 400) {
                            console.log(`QQ酷推(Cool Push)发送${pushMode(QQ_MODE)}推送失败：${data}\n`)
                        } else {
                            console.log(`酷推推送异常: ${data.msg}`);
                        }
                    } catch (error) {
                        console.log(error);
                    } finally {
                        resolve()
                    }
                },
                failure: err => {
                    console.log(`发送${pushMode(QQ_MODE)}通知调用API失败！！\n`)
                    throw new Error(err);
                }
            })
        } else {
            console.log('您未提供酷推的SKEY，取消QQ推送消息通知\n');
            resolve()
        }
    })
}

function barkNotify(text, desp, params = {}) {
    return new Promise(resolve => {
        if (BARK_PUSH) {
            HttpRequest({
                method: 'GET',
                url: `${BARK_PUSH}/${encodeURIComponent(text)}/${encodeURIComponent(desp)}`,
                query: {
                    ...params,
                    sound: BARK_SOUND,
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.code === 200) {
                            console.log('Bark APP发送通知消息成功\n')
                        } else {
                            console.log(`${data.message}\n`);
                        }
                    } catch (error) {
                        console.log(error);
                    } finally {
                        resolve()
                    }
                },
                failure: err => {
                    console.log('Bark APP发送通知调用API失败！！\n');
                    resolve();
                    throw new Error(err)
                }
            })
        } else {
            console.log('您未提供Bark的APP推送BARK_PUSH，取消Bark推送消息通知\n');
            resolve()
        }
    })
}

function tgBotNotify(text, desp) {
    return new Promise(resolve => {
        if (TG_BOT_TOKEN && TG_USER_ID) {
            let options = {
                method: 'POST',
                url: `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`,
                config: {
                    retry: false
                },
                contents: {
                    chat_id: TG_USER_ID,
                    text,
                    desp,
                    disable_web_page_preview: true
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json'
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.ok) {
                            console.log('Telegram发送通知消息完成。\n')
                        } else if (data.error_code === 400) {
                            console.log('请主动给bot发送一条消息并检查接收用户ID是否正确。\n')
                        } else if (data.error_code === 401) {
                            console.log('Telegram bot token 填写错误。\n')
                        }
                    } catch (error) {
                        console.log(error);
                    } finally {
                        resolve()
                    }
                },
                failure: err => {
                    console.log('telegram发送通知消息失败！！\n')
                    resolve()
                    throw new Error(err)
                }
            }
            if (TG_PROXY_HOST && TG_PROXY_PORT) {
                options.proxy = {
                    hostname: TG_PROXY_HOST,
                    port: TG_PROXY_PORT * 1
                }
            }
            HttpRequest(options)
        } else {
            console.log('您未提供telegram机器人推送所需的TG_BOT_TOKEN和TG_USER_ID，取消telegram推送消息通知\n');
            resolve()
        }
    })
}

function ddBotNotify(text, desp) {
    return new Promise(resolve => {
        if (DD_BOT_TOKEN && DD_BOT_SECRET) {
            const crypto = require('crypto');
            const dateNow = Date.now();
            const hmac = crypto.createHmac('sha256', DD_BOT_SECRET);
            hmac.update(`${dateNow}\n${DD_BOT_SECRET}`);
            const result = encodeURIComponent(hmac.digest('base64'));
            HttpRequest({
                method: 'POST',
                url: `https://oapi.dingtalk.com/robot/send`,
                query: {
                    access_token: DD_BOT_TOKEN,
                    timestamp: dateNow,
                    sign: result
                },
                config: {
                    retry: false
                },
                contents: {
                    msgtype: "text",
                    text: {
                        content: `${text}\n\n${desp}`
                    }
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.errcode === 0) {
                            console.log('钉钉发送通知消息完成。\n')
                        } else {
                            console.log(`${data.errmsg}\n`)
                        }
                    } catch (e) {
                        console.log(e);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    console.log('钉钉发送通知消息失败！！\n')
                    throw new Error(err);
                }
            })
        } else if (DD_BOT_TOKEN) {
            HttpRequest({
                method: 'POST',
                url: `https://oapi.dingtalk.com/robot/send`,
                query: {
                    access_token: DD_BOT_TOKEN
                },
                config: {
                    retry: false
                },
                contents: {
                    msgtype: "text",
                    text: {
                        content: `${text}\n\n${desp}`
                    }
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.errcode === 0) {
                            console.log('钉钉发送通知消息完成。\n')
                        } else {
                            console.log(`${data.errmsg}\n`)
                        }
                    } catch (e) {
                        console.log(e);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    console.log('钉钉发送通知消息失败！！\n');
                    resolve();
                    throw new Error(err)
                }
            })
        } else {
            console.log('您未提供钉钉机器人推送所需的DD_BOT_TOKEN或者DD_BOT_SECRET，取消钉钉推送消息通知\n');
            resolve()
        }
    })
}

function qywxBotNotify(text, desp) {
    return new Promise(resolve => {
        if (QYWX_KEY) {
            HttpRequest({
                method: 'POST',
                url: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${QYWX_KEY}`,
                contents: {
                    msgtype: 'text',
                    text: {
                        content: `${text}\n\n${desp}`,
                    },
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.errcode === 0) {
                            console.log('企业微信发送通知消息完成。\n');
                        } else {
                            console.log(`${data.errmsg}\n`);
                        }
                    } catch (e) {
                        console.log(e);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    console.log('企业微信发送通知消息失败！！\n');
                    resolve();
                    throw new Error(err)
                }
            })
        } else {
            console.log('您未提供企业微信机器人推送所需的QYWX_KEY，取消企业微信推送消息通知\n');
            resolve();
        }
    });
}

function iGotNotify(text, desp, params = {}) {
    return new Promise(resolve => {
        if (IGOT_PUSH_KEY) {
            // 校验传入的IGOT_PUSH_KEY是否有效
            const IGOT_PUSH_KEY_REGX = new RegExp("^[a-zA-Z0-9]{24}$")
            if (!IGOT_PUSH_KEY_REGX.test(IGOT_PUSH_KEY)) {
                console.log('您所提供的IGOT_PUSH_KEY无效\n')
                resolve()
                return
            }
            HttpRequest({
                method: 'POST',
                url: `https://push.hellyw.com/${IGOT_PUSH_KEY.toLowerCase()}`,
                contents: {
                    ...params,
                    title: text,
                    content: desp
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json'
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.ret === 0) {
                            console.log('iGot发送通知消息成功\n')
                        } else {
                            console.log(`iGot发送通知消息失败：${data.errMsg}\n`)
                        }
                    } catch (e) {
                        console.log(e);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    console.log('发送通知调用API失败！！\n')
                    resolve();
                    throw new Error(err)
                }
            })
        } else {
            console.log('您未提供iGot的推送IGOT_PUSH_KEY，取消iGot推送消息通知\n');
            resolve()
        }
    })
}

function pushPlusNotify(text, desp) {
    return new Promise(resolve => {
        if (PUSH_PLUS_TOKEN) {
            HttpRequest({
                method: 'POST',
                url: 'https://pushplus.hxtrip.com/send',
                contents: {
                    token: PUSH_PLUS_TOKEN,
                    title: text,
                    content: desp,
                    topic: PUSH_PLUS_USER
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.code === 200) {
                            console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息完成。\n`)
                        } else {
                            console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息失败：${data.msg}\n`)
                        }
                    } catch (e) {
                        console.log(e);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息失败！！\n`)
                    resolve();
                    throw new Error(err)
                }
            })
        } else {
            console.log('您未提供push+推送所需的PUSH_PLUS_TOKEN，取消push+推送消息通知\n');
            resolve()
        }
    })
}

module.exports = {
    sendNotify
}